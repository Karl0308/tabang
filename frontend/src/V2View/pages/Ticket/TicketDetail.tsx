import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCopy } from "@fortawesome/free-solid-svg-icons";
import { Attachment, Ticket } from "../../objects/Ticket";
import { User } from "../../objects/User";
import { Branch } from "../../objects/Branch";
import axios from "axios";
import { APIURLS } from "../../../APIURLS";
import Datetime from "react-datetime";
import fileIcon from "../../../img/file.png";
import videoIcon from "../../../img/video.png";
import { GalleryModal } from "../../component/GalleryModal";
import ReactDOM from "react-dom";
import { useToast } from "../../component/ToastContext";
import CommentsTab from "./TicketComponent/CommentsTab";
import HistoryTab from "./TicketComponent/HistoryTab";
import RelatedTab from "./TicketComponent/RelatedTab";
import AssetsTab from "./TicketComponent/AssetTab";
import SuppliesTab from "./TicketComponent/SuppliesTab";
import CatchUpTab from "./TicketComponent/CatchUpTab";
import { Department } from "../../objects/Department";
import { set } from "react-hook-form";

interface TicketDetailProps {
  selected: Ticket | null;
  setSelected: React.Dispatch<React.SetStateAction<Ticket | null>>;
  handleSave: () => void;
  handleClose: () => void;
  isTicketView: boolean | true;
  users: User[];
  branches: Branch[];
  departments: Department[];
}

export default function TicketDetail({
  selected,
  setSelected,
  handleClose,
  handleSave,
  isTicketView,
  users,
  branches,
  departments,
}: TicketDetailProps) {
  let userRole = localStorage.getItem("role");
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "comments" | "history" | "related" | "assets" | "supplies" | "catchup"
  >("comments");

  const [isLoading, setIsLoading] = useState(false);
  const [selectBgColor, setSelectBgColor] = useState("bg-yellow-400");

  const [ShowResolution, setShowResolution] = useState(false);
  const [resolution, setResolution] = useState("");
  const initialPerformanceRatings = {
    qualityOfWork: 5,
    adherenceToBrief: 5,
    timeliness: 5,
    communicationAndCollaboration: 5,
    overallSatisfaction: 5,
  };
  const [performanceRatings, setPerformanceRatings] = useState(
    initialPerformanceRatings,
  );
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadedAttachments, setLoadedAttachments] = useState<
    Record<number, string>
  >({});
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Additional assignees state
  const [additionalAssignees, setAdditionalAssignees] = useState<User[]>([]);
  const [selectedNewAssignee, setSelectedNewAssignee] = useState<number | "">(
    "",
  );

  // Selected departments state
  const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
    useState(false);

  // Due date change modal state
  const [showDueDateReasonModal, setShowDueDateReasonModal] = useState(false);
  const [pendingDueDate, setPendingDueDate] = useState<Date | null>(null);
  const [dueDateChangeReason, setDueDateChangeReason] = useState("");

  const axiosInstance = axios.create({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const onChangeBranch = (e: any) => {
    if (isLoading) {
      return;
    }
    setSelected((prevSelected) => {
      if (!prevSelected) {
        return prevSelected;
      }

      return {
        ...prevSelected,
        branchId: Number(e.target.value),
      };
    });

    saveTicketProp("branchId", e.target.value);
  };
  const onChangeAssignee = (e: any) => {
    if (isLoading) {
      return;
    }
    setSelected((prevSelected) => {
      if (!prevSelected) {
        return prevSelected;
      }

      return {
        ...prevSelected,
        assigneeId: Number(e.target.value),
      };
    });

    saveTicketProp("assigneeId", e.target.value);
  };

  // Add additional assignee
  const onAddAdditionalAssignee = () => {
    if (
      selectedNewAssignee === "" ||
      selectedNewAssignee === selected?.assigneeId
    ) {
      return;
    }

    // Check if already added
    if (additionalAssignees.some((u) => u.id === selectedNewAssignee)) {
      return;
    }

    const userToAdd = users.find((u) => u.id === selectedNewAssignee);
    if (!userToAdd) return;

    const transformLink = {
      ticketId: selected?.id || 0,
      userId: selectedNewAssignee,
    };
    axiosInstance
      .post(APIURLS.ticket.AddAdditionalAssignee(), transformLink)
      .then((res) => {
        setAdditionalAssignees((prev) => [...prev, userToAdd]);
        setSelectedNewAssignee("");
      })
      .catch((error) => {})
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Remove additional assignee
  const onRemoveAdditionalAssignee = (assigneeId: number) => {
    const transformLink = {
      ticketId: selected?.id || 0,
      userId: assigneeId,
    };
    axiosInstance
      .post(APIURLS.ticket.RemoveAdditionalAssignee(), transformLink)
      .then((res) => {
        setAdditionalAssignees((prev) =>
          prev.filter((u) => u.id !== assigneeId),
        );
      })
      .catch((error) => {})
      .finally(() => {
        setIsLoading(false);
      });
  };

  const FetchAdditionalAssignee = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(
        APIURLS.ticket.GetAdditionalAssigneeByTicketId() + selected?.id,
      );

      setAdditionalAssignees(res.data);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle department selection
  const onToggleDepartment = (departmentId: number) => {
    const transformLink = {
      ticketId: selected?.id || 0,
      departmentId: departmentId,
    };

    axiosInstance
      .post(APIURLS.ticket.AddRemoveDepartment(), transformLink)
      .then((res) => {
        if (selectedDepartments.includes(departmentId)) {
          setSelectedDepartments((prev) =>
            prev.filter((id) => id !== departmentId),
          );
        } else {
          setSelectedDepartments((prev) => [...prev, departmentId]);
        }
      })
      .catch((error) => {})
      .finally(() => {
        setIsLoading(false);
      });
    // TODO: Save to API when ready
  };

  // Get department name by ID
  const getDepartmentNameById = (departmentId: number): string => {
    const department = departments.find((d) => d.id === departmentId);
    return department?.name || "Unknown";
  };

  const saveTicketProp = (name: string, value: string) => {
    setIsLoading(true);
    axiosInstance
      .post(
        APIURLS.ticket.saveTicketProp() +
          "userId= " +
          localStorage.getItem("id") +
          "&ticketId= " +
          selected?.id +
          "&name=" +
          name +
          "&value=" +
          encodeURIComponent(value),
      )
      .then(
        (result) => {
          setIsLoading(false);
        },
        (error) => {
          setIsLoading(false);
        },
      );
  };
  const onChangePriority = (e: any) => {
    if (isLoading) {
      return;
    }
    setSelected((prevSelected) => {
      if (!prevSelected) {
        return prevSelected;
      }

      return {
        ...prevSelected,
        priority: Number(e.target.value),
      };
    });

    saveTicketProp("priority", e.target.value);
  };
  const onChangeDepartmentBase = (e: any) => {
    if (isLoading) {
      return;
    }
    setSelected((prevSelected) => {
      if (!prevSelected) {
        return prevSelected;
      }

      return {
        ...prevSelected,
        departmentBase: Number(e.target.value),
      };
    });

    saveTicketProp("departmentBase", e.target.value);
  };
  const onChangeDueDate = (e: string | Date) => {
    if (isLoading) {
      return;
    }

    const newDate = typeof e === "string" ? new Date(e) : e;

    if (isNaN(newDate.getTime())) {
      return;
    }

    // Store pending date and show reason modal
    setPendingDueDate(newDate);
    setDueDateChangeReason("");
    setShowDueDateReasonModal(true);
  };

  const onSubmitDueDateChange = () => {
    if (!pendingDueDate || !dueDateChangeReason.trim()) {
      return;
    }

    setSelected((prevSelected) => {
      if (!prevSelected) {
        return prevSelected;
      }

      return {
        ...prevSelected,
        dueDate: pendingDueDate,
      };
    });

    // Save due date with reason
    saveTicketProp(
      "dueDate",
      pendingDueDate.toString() + "-(Reason : " + dueDateChangeReason + ")",
    );
    // TODO: Save the reason to API when ready
    // saveTicketProp("dueDateChangeReason", dueDateChangeReason);

    // Reset modal state
    setShowDueDateReasonModal(false);
    setPendingDueDate(null);
    setDueDateChangeReason("");
  };

  const onCancelDueDateChange = () => {
    setShowDueDateReasonModal(false);
    setPendingDueDate(null);
    setDueDateChangeReason("");
  };

  useEffect(() => {
    setIsLoading(true);

    if (selected) {
      setSelectBgColor(getStatusColor(selected.status));
      setSelectedDepartments(selected.departmentIds || []);
      FetchAdditionalAssignee();
      axiosInstance
        .get(APIURLS.ticket.getTicketAttachmentById() + selected.id)
        .then((res) => res.data)
        .then(
          async (result: Attachment[]) => {
            setAttachments(result);

            // Process each attachment lazily - Gather promises first
            const promises = result
              .filter(
                (attachment) =>
                  !loadedAttachments[attachment.id] &&
                  attachment.contentType.startsWith("image/"),
              )
              .map(async (attachment: Attachment) => {
                await handleLazyLoad(attachment);
              });
            // Await all promises
            await Promise.all(promises);

            // Once all are loaded, set loading to false
            setIsLoading(false);
          },
          (error) => {
            setIsLoading(false);
          },
        );
    }
  }, [selected]);

  const handleLazyLoad = async (attachment: Attachment) => {
    // Check if the attachment is already loaded
    if (loadedAttachments[attachment.id]) return;

    try {
      // Fetch content of the attachment
      const fileData = await fetchAttachmentContent(attachment.id);
      if (fileData) {
        if (attachment.contentType.startsWith("video/")) {
          const videoUrl = `data:${fileData.contentType};base64,${fileData.content}`;

          setLoadedAttachments((prev) => ({
            ...prev,
            [attachment.id]: videoUrl,
          }));
        } else if (attachment.contentType.startsWith("image/")) {
          const imageUrl = `data:${fileData.contentType};base64,${fileData.content}`;

          // Set the image URL in the state (for the img tag)
          setLoadedAttachments((prev) => ({
            ...prev,
            [attachment.id]: imageUrl,
          }));
        } else {
          // Handle other content types (e.g., video, file) if needed
          // You can use a similar approach to handle videos or other files if necessary
          // const fileUrl = URL.createObjectURL(new Blob([new Uint8Array(fileData.content)], { type: fileData.contentType }));

          const blob = new Blob(
            [Uint8Array.from(atob(fileData.content), (c) => c.charCodeAt(0))],
            { type: fileData.contentType },
          );
          const fileUrl = URL.createObjectURL(blob);

          setLoadedAttachments((prev) => ({
            ...prev,
            [attachment.id]: fileUrl,
          }));
        }
      }
    } catch (error) {}
  };

  const fetchAttachmentContent = async (id: number) => {
    try {
      const res = await axiosInstance.get(
        APIURLS.ticket.getAttachmentById() + id,
      );
      return res.data; // Assuming content is in base64 format
    } catch (error) {
      return null;
    }
  };

  const formatTimeDifference = (from: string, to: string) => {
    const currentDate = new Date(from);
    const creationDate = new Date(to);

    const timeDifference = currentDate.getTime() - creationDate.getTime();

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m ago`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    } else {
      return `${minutes}m ago`;
    }
  };
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "0") {
      setResolution("");
      setPerformanceRatings(initialPerformanceRatings);
      setShowResolution(true);
      return;
    }
    if (selected) {
      setSelected({ ...selected, status: Number(e.target.value) });
      setSelectBgColor(getStatusColor(Number(e.target.value)));
      saveTicketProp("status", e.target.value);
    }
  };
  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-yellow-400 text-white dark:text-gray-700 font-bold";
      case 2:
        return "bg-red-400 text-white dark:text-gray-700 font-bold";
      case 3:
        return "bg-blue-400 text-white dark:text-gray-700font-bold";
      case 0:
        return "bg-green-400 text-white dark:text-gray-700font-bold";
      default:
        return "bg-yellow-400 text-white dark:text-gray-700font-bold";
    }
  };

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setIsGalleryOpen(true);
  };

  const UpdateTicket = () => {
    if (!selected) return; // Ensure `selected` is not null or undefined

    // Safely parse `localStorage` value
    const currentUserId = parseInt(localStorage.getItem("id") || "0", 10);
    if (isNaN(currentUserId)) {
      return;
    }

    const ticketToSave = selected;
    ticketToSave.currentUserId = currentUserId;
    ticketToSave.oldStatus = selected.status;
    ticketToSave.status = 0;
    ticketToSave.resolution = resolution;
    ticketToSave.ticketAssetsString = "";
    ticketToSave.quality = performanceRatings.qualityOfWork;
    ticketToSave.timeliness = performanceRatings.timeliness;
    ticketToSave.communication = performanceRatings.communicationAndCollaboration;
    ticketToSave.adherence = performanceRatings.adherenceToBrief;
    ticketToSave.overall = performanceRatings.overallSatisfaction;
    ticketToSave.feedback = resolution;
    setIsLoading(true);

    axiosInstance.post(APIURLS.ticket.updateTicket(), ticketToSave).then(
      (result) => {
        setSelected((prevSelected) => {
          if (!prevSelected) return null;

          return {
            ...prevSelected,
            currentUserId: currentUserId,
            status: 0,
          };
        });

        setSelectBgColor(getStatusColor(0)); // Update background color
        setShowResolution(false); // Hide resolution modal
        setIsLoading(false); // Stop loading
      },
      (error) => {
        // Handle error
        setIsLoading(false);
      },
    );
  };

  const onBlurTitle = (e: any) => {
    if (selected !== null) saveTicketProp("title", selected.title);
  };
  const onBlurDescription = (e: any) => {
    if (selected !== null) saveTicketProp("description", selected.description);
  };

  return (
    <>
      <div>
        <div className="flex flex-col h-full">
          {/* HEADER */}
          <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="text-white">
                <div className="text-xs font-semibold opacity-90 uppercase tracking-wide mb-1">
                  Ticket Number
                </div>

                <div className="text-3xl font-extrabold flex items-center gap-3">
                  <span className="bg-white/20 px-4 py-1 rounded-lg backdrop-blur-sm">
                    {selected?.ticketNumber || "—"}
                  </span>

                  <button
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 transform hover:scale-110"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        window.location.origin +
                          "/ticketview/" +
                          (selected?.ticketNumber || ""),
                      );
                      showToast("Copied to clipboard!", "success");
                    }}
                    title="Copy ticket link"
                  >
                    <FontAwesomeIcon icon={faCopy} className="text-lg" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="text-white hover:text-white p-3 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 transform hover:scale-110"
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} className="text-2xl" />
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wide">
                  Status
                </label>
                <select
                  className={`w-full rounded-xl py-4 px-5 text-center text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 ${selectBgColor} appearance-none cursor-pointer`}
                  value={selected?.status ?? ""}
                  onChange={handleSelectChange}
                  disabled={
                    userRole === "0" || userRole === "50" || userRole === "2"
                      ? false
                      : true
                  }
                >
                  <option value={1} className={getStatusColor(1)}>
                    🟡 OPEN
                  </option>
                  <option value={2} className={getStatusColor(2)}>
                    🔴 ON HOLD
                  </option>
                  <option value={3} className={getStatusColor(3)}>
                    🔵 IN PROGRESS
                  </option>
                  <option value={0} className={getStatusColor(0)}>
                    🟢 DONE
                  </option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                  Title
                </label>
                <input
                  type="text"
                  className="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  value={selected?.title || ""}
                  onChange={(e) => {
                    if (!selected) return;
                    setSelected({ ...selected, title: e.target.value });
                  }}
                  onBlur={onBlurTitle}
                  placeholder="Enter ticket title..."
                />
              </div>

              {/* Description block (Reporter / IP / Location / Asset / Description) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Description & Details
                </label>

                <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-5 space-y-3 text-sm shadow-md">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-700 dark:text-blue-400 min-w-[120px]">
                      👤 Reporter:
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {selected?.reporterName || "—"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-700 dark:text-blue-400 min-w-[120px]">
                      🌐 IP Address:
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium font-mono">
                      {selected?.ipAddress || "—"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-700 dark:text-blue-400 min-w-[120px]">
                      📍 Location:
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {selected?.location || "—"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-blue-700 dark:text-blue-400 min-w-[120px]">
                      🏷️ Asset Tag:
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {selected?.assetTag || "—"}
                    </span>
                  </div>
                  <div className="pt-2 border-t-2 border-gray-300 dark:border-gray-600">
                    <label className="font-bold text-blue-700 dark:text-blue-400 block mb-2 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Problem Concern Details:
                    </label>

                    <textarea
                      value={selected?.description || ""}
                      onChange={(e) => {
                        if (!selected) return;
                        setSelected({
                          ...selected,
                          description: e.target.value,
                        });
                      }}
                      onBlur={onBlurDescription}
                      rows={4}
                      className="w-full rounded-xl border-2 border-gray-300 dark:border-gray-600 px-4 py-3 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter problem details..."
                    />
                  </div>
                </div>
              </div>

              {/* Ticket details (Date Filed / Duration / Branch / Department / etc.) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    Date Created
                  </label>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-200 dark:border-blue-900 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white shadow-sm">
                    {selected?.calledIn
                      ? new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }).format(new Date(selected.calledIn))
                      : ""}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Duration
                  </label>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-purple-900 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white shadow-sm">
                    {selected?.calledIn && selected?.timeStamp
                      ? selected?.status === 0
                        ? formatTimeDifference(
                            selected.timeStamp.toString(),
                            selected.calledIn.toString(),
                          )
                        : formatTimeDifference(
                            new Date().toString(),
                            selected.calledIn.toString(),
                          )
                      : "N/A"}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Due Date
                  </label>
                  <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm shadow-sm hover:shadow-md transition-all duration-200">
                    <Datetime
                      className="w-full text-sm bg-transparent border-none p-0 m-0"
                      value={
                        selected?.dueDate ? new Date(selected.dueDate) : ""
                      }
                      onChange={(date: any) => {
                        if (date && date._isValid !== false) {
                          onChangeDueDate(date.toDate ? date.toDate() : date);
                        }
                      }}
                      closeOnSelect={true}
                      dateFormat="MM/DD/YYYY"
                      timeFormat={false}
                      inputProps={{
                        placeholder: selected?.dueDate
                          ? ""
                          : "Please select due date...",
                        disabled: !(userRole === "0" || userRole === "50"),
                        className:
                          "w-full text-sm bg-transparent border-none text-left p-0",
                        style: { boxShadow: "none" },
                      }}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Priority
                  </label>
                  <select
                    value={selected?.priority || ""}
                    onChange={onChangePriority}
                    disabled={
                      userRole === "0" || userRole === "50" ? false : true
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 font-medium cursor-pointer"
                  >
                    <option value={1}>🟢 Low</option>
                    <option value={2}>🟡 Medium</option>
                    <option value={3}>🟠 High</option>
                    <option value={4}>🔴 Critical</option>
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Branch
                  </label>
                  <select
                    value={selected?.branchId || ""}
                    onChange={onChangeBranch}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm
                       text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 font-medium cursor-pointer"
                  >
                    <option key={0} value={0}>
                      Unassigned
                    </option>
                    {branches.map((obj) => (
                      <option key={obj.id} value={obj.id}>
                        {obj.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Department
                    {selectedDepartments.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                        {selectedDepartments.length}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm
                         text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 font-medium cursor-pointer text-left flex items-center justify-between"
                    >
                      <span
                        className={
                          selectedDepartments.length === 0
                            ? "text-gray-400"
                            : ""
                        }
                      >
                        {selectedDepartments.length === 0
                          ? "Select departments..."
                          : selectedDepartments
                              .map((id) => getDepartmentNameById(id))
                              .join(", ")}
                      </span>
                      <svg
                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isDepartmentDropdownOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown menu */}
                    {isDepartmentDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {departments.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                            No departments available
                          </div>
                        ) : (
                          departments.map((dept) => (
                            <label
                              key={dept.id}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={selectedDepartments.includes(dept.id)}
                                onChange={() => onToggleDepartment(dept.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {dept.name}
                              </span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Assignee
                  </label>
                  <select
                    value={selected?.assigneeId || ""}
                    onChange={onChangeAssignee}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm
                       text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 font-medium cursor-pointer"
                  >
                    <option value="">Select assignee...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        👤 {u.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reporter (readonly) */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Reporter
                  </label>
                  <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 border-2 border-green-200 dark:border-green-900 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 dark:text-white shadow-sm">
                    👤 {selected?.reporterText || "—"}
                  </div>
                </div>

                {/* Additional Assignees */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Additional Assignees
                    <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-purple-600 text-white rounded-full">
                      {additionalAssignees.length}
                    </span>
                  </label>

                  {/* Add new assignee */}
                  <div className="flex gap-2 mb-3">
                    <select
                      value={selectedNewAssignee}
                      onChange={(e) =>
                        setSelectedNewAssignee(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                      className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm
                         text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm hover:shadow-md transition-all duration-200 font-medium cursor-pointer"
                    >
                      <option value="">Select additional assignee...</option>
                      {users
                        .filter(
                          (u) =>
                            u.id !== selected?.assigneeId &&
                            !additionalAssignees.some((a) => a.id === u.id),
                        )
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            👤 {u.fullName}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={onAddAdditionalAssignee}
                      disabled={selectedNewAssignee === ""}
                      className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm
                         hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* List of additional assignees */}
                  {additionalAssignees.length > 0 ? (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-2 border-purple-200 dark:border-purple-900 rounded-xl p-3 space-y-2">
                      {additionalAssignees.map((assignee) => (
                        <div
                          key={assignee.id}
                          className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                              {(assignee.fullName || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {assignee.fullName}
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              onRemoveAdditionalAssignee(assignee.id)
                            }
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                            title="Remove assignee"
                            disabled={
                              userRole === "0" || userRole === "50"
                                ? false
                                : true
                            }
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No additional assignees. Select from the dropdown above to
                      add.
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                    />
                  </svg>
                  Attachments
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                    {attachments.filter((att) => !att.isDeleted).length}
                  </span>
                </label>
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-5 text-sm text-gray-500 shadow-md">
                  {attachments.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {attachments
                        .filter((att) => !att.isDeleted)
                        .map((attachment, index) => (
                          <div
                            key={attachment.id}
                            className="relative cursor-pointer rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-xl transition-all duration-200 transform hover:scale-105 p-2 flex flex-col items-center bg-white dark:bg-gray-800"
                            onClick={() => handleImageClick(index)}
                          >
                            {/* Thumbnail */}
                            {attachment.contentType.startsWith("video/") ? (
                              <img
                                src={videoIcon}
                                alt="Video Icon"
                                className="w-full sm:w-24 h-20 sm:h-24 object-contain rounded-md mb-1"
                              />
                            ) : attachment.contentType.startsWith("image/") ? (
                              loadedAttachments[attachment.id] ? (
                                <img
                                  src={loadedAttachments[attachment.id]}
                                  alt="Attachment"
                                  className="w-full sm:w-24 h-20 sm:h-24 object-cover rounded-md mb-1"
                                />
                              ) : (
                                <img
                                  src={fileIcon}
                                  alt="File Icon"
                                  className="w-full sm:w-24 h-20 sm:h-24 object-contain rounded-md mb-1"
                                />
                              )
                            ) : (
                              <img
                                src={fileIcon}
                                alt="File Icon"
                                className="w-full sm:w-24 h-20 sm:h-24 object-contain rounded-md mb-1"
                              />
                            )}

                            {/* Filename */}
                            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 truncate text-center w-full">
                              {attachment.fileName}
                            </p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No attachments found.
                    </div>
                  )}
                </div>
              </div>

              {/* Tabs Container */}
              <div className="w-full mx-auto mt-8">
                {/* Tab Buttons */}
                <div className="border-b-2 border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-2 overflow-x-auto no-scrollbar">
                    {[
                      { name: "comments", icon: "💬", label: "Comments" },
                      { name: "history", icon: "📜", label: "History" },
                      { name: "related", icon: "🔗", label: "Related" },
                      { name: "assets", icon: "🛠️", label: "Assets" },
                      // { name: "supplies", icon: "📎", label: "Supplies" },
                      // { name: "catchup", icon: "⏱️", label: "Catch Up" },
                    ].map((tab) => (
                      <button
                        key={tab.name}
                        className={`flex items-center gap-2 py-3 px-5 text-sm font-bold whitespace-nowrap
            rounded-t-xl
            transition-all duration-200 transform
            ${
              activeTab === tab.name
                ? "border-b-4 border-blue-600 text-blue-600 dark:text-blue-400 bg-gradient-to-t from-blue-50 to-transparent dark:from-gray-800 scale-105 shadow-lg"
                : "border-b-4 border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-105"
            }`}
                        onClick={() => setActiveTab(tab.name as any)}
                      >
                        <span className="text-lg">{tab.icon}</span>
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="py-6 text-gray-600 dark:text-gray-300 min-h-[120px] bg-white dark:bg-gray-800 rounded-b-xl shadow-sm border-2 border-t-0 border-gray-200 dark:border-gray-700 p-4">
                  <div>
                    {activeTab === "comments" && (
                      <CommentsTab
                        ticketId={selected?.id}
                        _attachments={attachments || []}
                        _loadedAttachments={loadedAttachments}
                        _users={users}
                        onOpenAttachment={(index) => handleImageClick(index)}
                        onImageOpen={handleImageClick}
                        setLoadedAttachments={setLoadedAttachments}
                        onAttachmentsChange={(updatedAttachments) => {
                          // Attachments updated
                        }}
                        onLoadedAttachmentsChange={(
                          updatedLoadedAttachments,
                        ) => {
                          // Loaded attachments updated
                        }}
                      />
                    )}
                    {activeTab === "history" && (
                      <HistoryTab ticketId={selected?.id || ""} />
                    )}
                    {activeTab === "related" && (
                      <RelatedTab ticketId={selected?.id || ""} />
                    )}
                    {activeTab === "assets" && (
                      <AssetsTab ticketId={selected?.id || ""} />
                    )}
                    {activeTab === "supplies" && (
                      <SuppliesTab ticketId={selected?.id || ""} />
                    )}
                    {activeTab === "catchup" && (
                      <CatchUpTab ticketId={selected?.id || ""} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
        </div>
      </div>
      {ShowResolution && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Add Feedback
            </h2>

            {/* Warning Banner - Only show if any rating is 3 or below */}
            {Object.values(performanceRatings).some(
              (rating) => rating > 0 && rating <= 3,
            ) && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded-lg">
                <p className="text-sm font-bold text-red-700 dark:text-red-300">
                  ⚠️ Warning: Any 3-star or below rating will escalate this
                  issue for investigation.
                </p>
              </div>
            )}

            {/* Monthly Performance Rating */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                TICKET PERFORMANCE RATING
              </h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-1">
                <div>⭐ Poor</div>
                <div>⭐⭐ Below Average</div>
                <div>⭐⭐⭐ Average</div>
                <div>⭐⭐⭐⭐ Good</div>
                <div>⭐⭐⭐⭐⭐ Excellent</div>
              </div>

              {/* Rating Categories */}
              <div className="space-y-3">
                {[
                  { key: "qualityOfWork", label: "1. Quality of Work" },
                  { key: "adherenceToBrief", label: "2. Adherence to Brief" },
                  { key: "timeliness", label: "3. Timeliness" },
                  {
                    key: "communicationAndCollaboration",
                    label: "4. Communication & Collaboration",
                  },
                  {
                    key: "overallSatisfaction",
                    label: "5. Overall Satisfaction",
                  },
                ].map((category) => (
                  <div key={category.key}>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {category.label}
                    </label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setPerformanceRatings((prev) => ({
                              ...prev,
                              [category.key]: star,
                            }))
                          }
                          className="text-2xl focus:outline-none transition-transform hover:scale-110"
                        >
                          {star <=
                          performanceRatings[
                            category.key as keyof typeof performanceRatings
                          ]
                            ? "⭐"
                            : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <textarea
              className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              rows={6}
              value={resolution || ""}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Enter your feedback here..."
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                onClick={() => setShowResolution(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                onClick={UpdateTicket}
                // disabled={resolution.trim().length === 0}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Due Date Change Reason Modal */}
      {showDueDateReasonModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-[450px]">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Change Due Date
            </h2>

            {/* New Due Date Display */}
            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                New Due Date:
              </p>
              <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {pendingDueDate
                  ? new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).format(pendingDueDate)
                  : "—"}
              </p>
            </div>

            {/* Reason Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Reason for Change <span className="text-red-500">*</span>
              </label>
              <textarea
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                rows={4}
                value={dueDateChangeReason}
                onChange={(e) => setDueDateChangeReason(e.target.value)}
                placeholder="Please provide a reason for changing the due date..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                onClick={onCancelDueDateChange}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                onClick={onSubmitDueDateChange}
                disabled={dueDateChangeReason.trim().length === 0}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Render gallery via portal */}
      {isGalleryOpen &&
        ReactDOM.createPortal(
          <GalleryModal
            attachments={attachments.filter((att) => !att.isDeleted)}
            loadedAttachments={loadedAttachments}
            initialIndex={currentIndex}
            onClose={() => setIsGalleryOpen(false)}
          />,
          document.body,
        )}
    </>
  );
}
