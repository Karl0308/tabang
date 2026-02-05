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
import CommentsTab from "../Ticket/TicketComponent/CommentsTab";
import HistoryTab from "../Ticket/TicketComponent/HistoryTab";
import RelatedTab from "../Ticket/TicketComponent/RelatedTab";
import AssetsTab from "../Ticket/TicketComponent/AssetTab";
import SuppliesTab from "../Ticket/TicketComponent/SuppliesTab";
import CatchUpTab from "../Ticket/TicketComponent/CatchUpTab";
import {
  SubtaskStatus,
  Workstream,
  WorkstreamSubtask,
} from "../../objects/Workstream";
import WorkstreamHistoryTab from "./WorkstreamComponent/WorkstreamHistoryTab";

interface WorkstreamDetailsProps {
  selected: Workstream | null;
  setSelected: React.Dispatch<React.SetStateAction<Workstream | null>>;
  handleSave: () => void;
  handleClose: () => void;
  isView: boolean | true;
  users: User[];
  branches: Branch[];
}

export default function WorkstreamDetail({
  selected,
  setSelected,
  handleClose,
  handleSave,
  isView,
  users,
  branches,
}: WorkstreamDetailsProps) {
  let userRole = localStorage.getItem("role");
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "comments" | "history" | "related" | "assets" | "supplies" | "catchup"
  >("history");

  const [isLoading, setIsLoading] = useState(false);
  const [selectBgColor, setSelectBgColor] = useState("bg-yellow-400");

  const [ShowResolution, setShowResolution] = useState(false);
  const [resolution, setResolution] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadedAttachments, setLoadedAttachments] = useState<
    Record<number, string>
  >({});
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const initialSubtaskState: WorkstreamSubtask = {
    id: 0, // temporary, will replace with Date.now() or API ID
    workstreamId: selected?.id || 0, // if modal opens, ensure selected exists
    title: "",
    description: "",
    assigneeId: 0,
    status: 0, // NotStarted
    startDate: undefined,
    dueDate: undefined,
    completedAt: undefined,
    estimatedEffortHours: undefined,
    isBlocking: false,
    createdAt: new Date(),
    branchId: 0,
  };
  const [subtaskModalData, setSubtaskModalData] =
    useState<WorkstreamSubtask>(initialSubtaskState);

  const [subtasks, setSubtasks] = useState<WorkstreamSubtask[]>([]);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);

  // Linked tickets state
  const [linkedTickets, setLinkedTickets] = useState<Ticket[]>([]);
  const [ticketSearchInput, setTicketSearchInput] = useState("");
  const [searchedTickets, setSearchedTickets] = useState<Ticket[]>([]);
  const [isSearchingTickets, setIsSearchingTickets] = useState(false);

  // Add linked ticket
  const onAddLinkedTicket = (ticket: Ticket) => {
    if (linkedTickets.some((t) => t.id === ticket.id)) {
      return;
    }
    const transformLink = {
      ticketId: ticket.id,
      workstreamId: selected?.id || 0,
    };
    axiosInstance
      .post(APIURLS.workstream.addLinkTicket(), transformLink)
      .then((res) => {
        setLinkedTickets((prev) => [...prev, ticket]);
        setTicketSearchInput("");
        setSearchedTickets([]);
      })
      .catch((error) => {})
      .finally(() => {
        setIsLoading(false);
      });

    // TODO: Save to API when ready
  };

  // Remove linked ticket
  const onRemoveLinkedTicket = (ticketId: number) => {
    const transformLink = {
      ticketId: ticketId,
      workstreamId: selected?.id || 0,
    };
    axiosInstance
      .post(APIURLS.workstream.removeLinkTicket(), transformLink)
      .then((res) => {
        setLinkedTickets((prev) => prev.filter((t) => t.id !== ticketId));
      })
      .catch((error) => {})
      .finally(() => {
        setIsLoading(false);
      });

    // TODO: Remove from API when ready
  };

  // Search tickets (placeholder - will connect to API later)
  const onSearchTickets = () => {
    if (!ticketSearchInput.trim()) {
      setSearchedTickets([]);
      return;
    }

    setIsSearchingTickets(true);
    // TODO: Replace with actual API call
    // For now, just reset searching state axiosInstance
    axiosInstance
      .get(APIURLS.ticket.getTicketSearch() + ticketSearchInput)
      .then((res) => res.data)
      .then(
        (result) => {
          if (result.length > 0) {
            setSearchedTickets(result);
          } else {
            setSearchedTickets([]);
          }

          return;
        },
        (error) => {},
      );
    setTimeout(() => {
      setIsSearchingTickets(false);
      // API will populate searchedTickets
    }, 500);
  };

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

    saveWorkstreamProp("branchId", e.target.value);
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

    saveWorkstreamProp("ownerId", e.target.value);
  };

  const saveWorkstreamProp = (name: string, value: string) => {
    setIsLoading(true);
    axiosInstance
      .post(
        APIURLS.workstream.saveWorkstreamProp() +
          "userId= " +
          localStorage.getItem("id") +
          "&workstreamId= " +
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

    saveWorkstreamProp("priority", e.target.value);
  };
  const onChangeStartDate = (e: string | Date) => {
    if (isLoading) {
      return;
    }

    const newDate = typeof e === "string" ? new Date(e) : e;

    if (isNaN(newDate.getTime())) {
      return;
    }

    setSelected((prevSelected) => {
      if (!prevSelected) {
        return prevSelected;
      }

      return {
        ...prevSelected,
        startDate: newDate,
      };
    });

    saveWorkstreamProp("startDate", newDate.toString()); // Pass the Date object directly
  };
  const onChangeDueDate = (e: string | Date) => {
    if (isLoading) {
      return;
    }

    const newDate = typeof e === "string" ? new Date(e) : e;

    if (isNaN(newDate.getTime())) {
      return;
    }

    setSelected((prevSelected) => {
      if (!prevSelected) {
        return prevSelected;
      }

      return {
        ...prevSelected,
        dueDate: newDate,
      };
    });

    saveWorkstreamProp("dueDate", newDate.toString()); // Pass the Date object directly
  };

  useEffect(() => {
    // setIsLoading(true);

    if (selected) {
      setSelectBgColor(getStatusColor(selected.status));
      FetchLinkTicket();
      // axiosInstance
      //   .get(APIURLS.ticket.getTicketAttachmentById() + selected.id)
      //   .then((res) => res.data)
      //   .then(
      //     async (result: Attachment[]) => {
      //       setAttachments(result);

      //       // Process each attachment lazily - Gather promises first
      //       const promises = result
      //         .filter(
      //           (attachment) =>
      //             !loadedAttachments[attachment.id] &&
      //             attachment.contentType.startsWith("image/")
      //         )
      //         .map(async (attachment: Attachment) => {
      //           await handleLazyLoad(attachment);
      //         });
      //       // Await all promises
      //       await Promise.all(promises);

      //       // Once all are loaded, set loading to false
      //       setIsLoading(false);
      //     },
      //     (error) => {
      //       console.error("Error fetching attachments:", error);
      //       setIsLoading(false);
      //     }
      //   );
    }
  }, [selected]);

  // const handleLazyLoad = async (attachment: Attachment) => {
  //   // Check if the attachment is already loaded
  //   if (loadedAttachments[attachment.id]) return;

  //   try {
  //     // Fetch content of the attachment
  //     const fileData = await fetchAttachmentContent(attachment.id);
  //     if (fileData) {
  //       if (attachment.contentType.startsWith("video/")) {
  //         const videoUrl = `data:${fileData.contentType};base64,${fileData.content}`;

  //         setLoadedAttachments((prev) => ({
  //           ...prev,
  //           [attachment.id]: videoUrl,
  //         }));
  //       } else if (attachment.contentType.startsWith("image/")) {
  //         const imageUrl = `data:${fileData.contentType};base64,${fileData.content}`;

  //         // Set the image URL in the state (for the img tag)
  //         setLoadedAttachments((prev) => ({
  //           ...prev,
  //           [attachment.id]: imageUrl,
  //         }));
  //       } else {
  //         // Handle other content types (e.g., video, file) if needed
  //         // You can use a similar approach to handle videos or other files if necessary
  //         // const fileUrl = URL.createObjectURL(new Blob([new Uint8Array(fileData.content)], { type: fileData.contentType }));

  //         const blob = new Blob(
  //           [Uint8Array.from(atob(fileData.content), (c) => c.charCodeAt(0))],
  //           { type: fileData.contentType }
  //         );
  //         const fileUrl = URL.createObjectURL(blob);
  //         console.log(fileData);

  //         setLoadedAttachments((prev) => ({
  //           ...prev,
  //           [attachment.id]: fileUrl,
  //         }));
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error loading attachment content:", error);
  //   }
  // };

  // const fetchAttachmentContent = async (id: number) => {
  //   try {
  //     const res = await axiosInstance.get(
  //       APIURLS.ticket.getAttachmentById() + id
  //     );
  //     return res.data; // Assuming content is in base64 format
  //   } catch (error) {
  //     console.error("Failed to fetch attachment content:", error);
  //     return null;
  //   }
  // };

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
    // if (e.target.value === "0") {
    //   setResolution("");
    //   setShowResolution(true);
    //   return;
    // }

    if (selected) {
      setSelected({ ...selected, status: Number(e.target.value) });
      setSelectBgColor(getStatusColor(Number(e.target.value)));
      saveWorkstreamProp("status", e.target.value);
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: // Planning
        return "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold shadow-md";
      case 1: // Active
        return "bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-md shadow-blue-500/30";
      case 2: // On Hold
        return "bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-md shadow-red-500/30";
      case 3: // Completed
        return "bg-gradient-to-r from-green-500 to-green-600 text-white font-bold shadow-md shadow-green-500/30";
      case 4: // Cancelled
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold shadow-md";
      default:
        return "bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold";
    }
  };

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setIsGalleryOpen(true);
  };

  // const UpdateTicket = () => {
  //   if (!selected) return; // Ensure `selected` is not null or undefined

  //   // Safely parse `localStorage` value
  //   const currentUserId = parseInt(localStorage.getItem("id") || "0", 10);
  //   if (isNaN(currentUserId)) {
  //     console.error("Invalid user ID");
  //     return;
  //   }

  //   const ticketToSave = selected;
  //   ticketToSave.currentUserId = currentUserId;
  //   ticketToSave.oldStatus = selected.status;
  //   ticketToSave.status = 0;
  //   ticketToSave.resolution = resolution;
  //   ticketToSave.ticketAssetsString = "";

  //   setIsLoading(true);

  //   axiosInstance.post(APIURLS.ticket.updateTicket(), ticketToSave).then(
  //     (result) => {
  //       setSelected((prevSelected) => {
  //         if (!prevSelected) return null;

  //         return {
  //           ...prevSelected,
  //           currentUserId: currentUserId,
  //           status: 0,
  //         };
  //       });

  //       setSelectBgColor(getStatusColor(0)); // Update background color
  //       setShowResolution(false); // Hide resolution modal
  //       setIsLoading(false); // Stop loading
  //     },
  //     (error) => {
  //       // Handle error
  //       console.error("Failed to update ticket:", error.response.data);
  //       setIsLoading(false);
  //     }
  //   );
  // };

  const addSubtask = () => {
    if (!subtaskModalData.title.trim() || !selected) return;

    const payload = {
      ...subtaskModalData,
      workstreamId: selected.id,
    };

    setIsLoading(true);

    axiosInstance.post(APIURLS.workstream.addSubtask(), payload).then(
      (result) => {
        setIsLoading(false);

        const saved = result.data ?? payload;

        setSubtasks((prev) => {
          const exists = prev.some((t) => t.id === saved.id);

          if (exists) {
            // UPDATE
            return prev.map((t) =>
              t.id === saved.id ? { ...t, ...saved } : t,
            );
          }

          // ADD
          return [...prev, saved];
        });

        setSubtaskModalData({
          ...initialSubtaskState,
          workstreamId: selected.id,
        });
        setShowSubtaskModal(false);
      },
      (error) => {
        setIsLoading(false);
      },
    );
  };

  const FetchLinkTicket = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(
        APIURLS.workstream.getWorkstreamTicketByWorkstreamId() + selected?.id,
      );
      setLinkedTickets(res.data);
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const statusStyles = {
    [SubtaskStatus.NotStarted]:
      "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 dark:from-gray-700 dark:to-gray-600 dark:text-gray-200",
    [SubtaskStatus.InProgress]:
      "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 dark:from-blue-900/50 dark:to-blue-800/50 dark:text-blue-200",
    [SubtaskStatus.Completed]:
      "bg-gradient-to-r from-green-100 to-green-200 text-green-700 dark:from-green-900/50 dark:to-green-800/50 dark:text-green-200",
    [SubtaskStatus.Blocked]:
      "bg-gradient-to-r from-red-100 to-red-200 text-red-700 dark:from-red-900/50 dark:to-red-800/50 dark:text-red-200",
  };

  return (
    <>
      <div>
        <div className="flex flex-col h-full">
          {/* HEADER */}
          <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <div className="text-white">
                <div className="text-sm font-medium opacity-90 tracking-wide">
                  Workstream No.
                </div>

                <div className="text-2xl font-bold flex items-center gap-3">
                  {selected?.workStreamNumber || "—"}

                  <button
                    className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        window.location.origin +
                          "/workstreamview/" +
                          (selected?.workStreamNumber || ""),
                      );
                      showToast("Copied to clipboard!", "success");
                    }}
                    title="Copy link to clipboard"
                  >
                    <FontAwesomeIcon icon={faCopy} className="text-lg" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-white active:scale-95"
              title="Close"
            >
              <FontAwesomeIcon icon={faTimes} className="text-2xl" />
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  className={`w-full rounded-xl py-3 px-4 text-center text-white font-bold text-lg ${selectBgColor} border-2 border-transparent shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  value={selected?.status ?? ""}
                  onChange={handleSelectChange}
                  disabled={
                    userRole === "0" || userRole === "50" ? false : true
                  }
                >
                  <option value={0} className={getStatusColor(0)}>
                    PLANNING
                  </option>
                  <option value={1} className={getStatusColor(1)}>
                    ACTIVE
                  </option>
                  <option value={2} className={getStatusColor(2)}>
                    ON HOLD
                  </option>
                  <option value={3} className={getStatusColor(3)}>
                    COMPLETED
                  </option>
                  <option value={4} className={getStatusColor(4)}>
                    CANCELLED
                  </option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm hover:shadow-md transition-all duration-200"
                    value={selected?.title || ""}
                    onChange={(e) => {
                      if (!selected) return;
                      setSelected({ ...selected, title: e.target.value });
                      saveWorkstreamProp("title", e.target.value);
                    }}
                    onBlur={(e) => {
                      saveWorkstreamProp("title", e.target.value);
                    }}
                    placeholder="Enter workstream title..."
                  />
                </div>
              </div>

              {/* Description block (Reporter / IP / Location / Asset / Description) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
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
                  Objective
                </label>

                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none shadow-sm hover:shadow-md transition-all duration-200"
                  value={selected?.objective || ""}
                  onChange={(e) => {
                    if (!selected) return;
                    setSelected({ ...selected, objective: e.target.value });
                    saveWorkstreamProp("objective", e.target.value);
                  }}
                  onBlur={(e) => {
                    saveWorkstreamProp("objective", e.target.value);
                  }}
                  placeholder="Describe the workstream objective and goals..."
                />
              </div>

              {/* Ticket details (Date Filed / Duration / Branch / Department / etc.) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
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
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm">
                    {selected?.createdAt
                      ? new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        }).format(new Date(selected.createdAt))
                      : "—"}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
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
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm">
                    {selected?.duration || "—"}
                  </div>
                </div>
                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-green-500"
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
                    Start Date
                  </label>
                  <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm shadow-sm hover:shadow-md transition-shadow duration-200">
                    <Datetime
                      className="w-full text-sm bg-transparent border-none p-0 m-0"
                      value={
                        selected?.startDate ? new Date(selected.startDate) : ""
                      }
                      onChange={(date: any) => {
                        if (date && date._isValid !== false) {
                          onChangeStartDate(date.toDate ? date.toDate() : date);
                        }
                      }}
                      closeOnSelect={true}
                      dateFormat="MM/DD/YYYY"
                      timeFormat={false}
                      inputProps={{
                        placeholder: selected?.startDate
                          ? ""
                          : "Select start date...",
                        disabled: !(userRole === "0" || userRole === "50"),
                        className:
                          "w-full text-sm bg-transparent border-none text-left p-0 text-gray-900 dark:text-gray-100",
                        style: { boxShadow: "none" },
                      }}
                    />
                  </div>
                </div>
                {/* Due Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-orange-500"
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
                    Due Date
                  </label>
                  <div className="bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm shadow-sm hover:shadow-md transition-shadow duration-200">
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
                          : "Select due date...",
                        disabled: !(userRole === "0" || userRole === "50"),
                        className:
                          "w-full text-sm bg-transparent border-none text-left p-0 text-gray-900 dark:text-gray-100",
                        style: { boxShadow: "none" },
                      }}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-red-500"
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
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value={1}>Low</option>
                    <option value={2}>Medium</option>
                    <option value={3}>High</option>
                    <option value={4}>Critical</option>
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-purple-500"
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
                       text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200"
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

                {/* Owner */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-blue-500"
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
                    Owner
                  </label>
                  <select
                    value={selected?.ownerId || ""}
                    onChange={onChangeAssignee}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm
                       text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <option value="">Select assignee...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Linked Tickets */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    Linked Tickets
                    <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-orange-500 text-white rounded-full">
                      {linkedTickets.length}
                    </span>
                  </label>

                  {/* Search and add ticket */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={ticketSearchInput}
                      onChange={(e) => setTicketSearchInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onSearchTickets();
                        }
                      }}
                      placeholder="Search ticket number..."
                      className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm
                         text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm hover:shadow-md transition-all duration-200 font-medium"
                    />
                    <button
                      onClick={onSearchTickets}
                      disabled={!ticketSearchInput.trim() || isSearchingTickets}
                      className="px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm
                         hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
                    >
                      {isSearchingTickets ? (
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      ) : (
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
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Search results dropdown */}
                  {searchedTickets.length > 0 && (
                    <div className="mb-3 bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-900 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                      {searchedTickets.map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => onAddLinkedTicket(ticket)}
                          disabled={linkedTickets.some(
                            (t) => t.id === ticket.id,
                          )}
                          className="w-full px-4 py-3 text-left hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-bold text-orange-600 dark:text-orange-400">
                                #{ticket.ticketNumber}
                              </span>
                              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300 truncate">
                                {ticket.title}
                              </span>
                            </div>
                            {linkedTickets.some((t) => t.id === ticket.id) && (
                              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                                Added
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* List of linked tickets */}
                  {linkedTickets.length > 0 ? (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 border-2 border-orange-200 dark:border-orange-900 rounded-xl p-3 space-y-2">
                      {linkedTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs">
                              #
                            </div>
                            <div>
                              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                {ticket.ticketNumber}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                {ticket.title}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => onRemoveLinkedTicket(ticket.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                            title="Remove linked ticket"
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
                      No linked tickets. Search by ticket number above to add.
                    </div>
                  )}
                </div>
              </div>

              {/*  <div className="mt-8 border-t-2 border-gray-200 dark:border-gray-700 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <label className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Subtasks
                  </label>
                  <button
                    onClick={() => setShowSubtaskModal(true)}
                    disabled={userRole !== "0" && userRole !== "50"}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl
                 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Subtask
                  </button>
                </div>

                <div className="space-y-4">
                  {subtasks.length === 0 && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                      <svg className="w-16 h-16 mx-auto mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      No subtasks added yet
                    </div>
                  )}

                  {subtasks.map((task) => (
                    <div
                      onClick={() => {
                        setSubtaskModalData(task);
                        setShowSubtaskModal(true);

                      }
                      }
                      key={task.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700
                   rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 active:scale-[0.99]"
                    >
                      <div className="flex-1 mb-3 sm:mb-0">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{task.title}</h3>
                        {task.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-0 justify-start sm:justify-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${statusStyles[task.status] ?? "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {SubtaskStatus[task.status] ?? "Not Started"}
                        </span>

                        {task.branchId != null && task.branchId > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-xs">
                            {branches.find((u) => u.id === task.branchId)?.name ?? "Branch"}
                          </span>
                        )}

                        {task.assigneeId != null && task.assigneeId > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-xs">
                            {users.find((u) => u.id === task.assigneeId)?.fullName ?? "Assignee"}
                          </span>
                        )}

                        {task.startDate && (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs">
                            Start: {new Date(task.startDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 text-xs">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2 items-center justify-end">
                        <button
                          className="text-gray-400 hover:text-gray-600 text-sm p-1 rounded-md transition"
                          title="Edit (coming soon)"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="text-gray-400 hover:text-red-500 text-sm p-1 rounded-md transition"
                          title="Delete"
                          onClick={() => setSubtasks(subtasks.filter((s) => s.id !== task.id))}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div> */}

              {/* Attachments */}
              {/* <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-sm text-gray-500">
                  {attachments.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {attachments
                        .filter((att) => !att.isDeleted)
                        .map((attachment, index) => (
                          <div
                            key={attachment.id}
                            className="relative cursor-pointer rounded-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-200 p-1 flex flex-col items-center"
                            onClick={() => handleImageClick(index)}
                          >
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

                            <p className="text-xs sm:text-sm text-gray-700 truncate text-center w-full">
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
              </div> */}

              {/* Tabs Container */}
              <div className="w-full max-w-4xl mx-auto mt-8">
                {/* Tab Buttons */}
                <div className="border-b-2 border-gray-200 dark:border-gray-700">
                  <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar">
                    {[
                      // { name: "comments", icon: "💬" },
                      { name: "history", icon: "📜" },
                      // { name: "related", icon: "🔗" },
                      // { name: "assets", icon: "🛠️" },
                      // { name: "supplies", icon: "📎" },
                      // { name: "catchup", icon: "⏱️" },
                    ].map((tab) => (
                      <button
                        key={tab.name}
                        className={`flex items-center gap-2 py-3 px-4 sm:px-6 text-sm font-semibold whitespace-nowrap
            rounded-t-xl
            transition-all duration-200
            ${
              activeTab === tab.name
                ? "border-b-4 border-blue-500 text-blue-600 dark:text-blue-400 bg-gradient-to-t from-blue-50 to-transparent dark:from-blue-900/30 dark:to-transparent shadow-md"
                : "border-b-4 border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50"
            }`}
                        onClick={() => setActiveTab(tab.name as any)}
                      >
                        <span className="text-lg">{tab.icon}</span>
                        <span>
                          {tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="py-8 text-gray-600 dark:text-gray-300 text-center min-h-[120px] bg-white dark:bg-gray-800/50 rounded-b-xl shadow-sm">
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
                          // Attachments updated
                        }}
                      />
                    )}
                    {activeTab === "history" && (
                      <WorkstreamHistoryTab workstreamId={selected?.id || ""} />
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

      {/* {ShowResolution && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Add Resolution
            </h2>
            <textarea
              className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
              rows={6}
              value={resolution || ""}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Enter your resolution here..."
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
                disabled={resolution.trim().length === 0}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )} */}

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

      {showSubtaskModal &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                      />
                    </svg>
                  </div>
                  {subtaskModalData.id ? "Edit Subtask" : "Add Subtask"}
                </h3>
                <button
                  onClick={() => setShowSubtaskModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
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

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter subtask title"
                    value={subtaskModalData.title}
                    onChange={(e) =>
                      setSubtaskModalData({
                        ...subtaskModalData,
                        title: e.target.value,
                      })
                    }
                    className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md transition-all duration-200"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-indigo-500"
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
                  Description
                </label>
                <textarea
                  placeholder="Enter description (optional)"
                  value={subtaskModalData.description}
                  onChange={(e) =>
                    setSubtaskModalData({
                      ...subtaskModalData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm hover:shadow-md transition-all duration-200"
                  rows={3}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Status
                </label>
                <select
                  value={subtaskModalData.status || ""}
                  onChange={(e) =>
                    setSubtaskModalData({
                      ...subtaskModalData,
                      status: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm
                       text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value={0}>Not Started</option>
                  <option value={1}>In Progress</option>
                  <option value={2}>Completed</option>
                  <option value={3}>Blocked</option>
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-500"
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
                  value={subtaskModalData.assigneeId || ""}
                  onChange={(e) =>
                    setSubtaskModalData({
                      ...subtaskModalData,
                      assigneeId: Number(e.target.value) || undefined,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm
                       text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value="">Select assignee...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-purple-500"
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
                  value={subtaskModalData.branchId || ""}
                  onChange={(e) =>
                    setSubtaskModalData({
                      ...subtaskModalData,
                      branchId: Number(e.target.value) || undefined,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-sm
                       text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <option value="">Select branch...</option>
                  {branches.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-green-500"
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
                  Start Date
                </label>
                <div className="bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm shadow-sm hover:shadow-md transition-shadow duration-200">
                  <Datetime
                    className="w-full text-sm bg-transparent border-none p-0 m-0"
                    value={
                      subtaskModalData.startDate
                        ? new Date(subtaskModalData.startDate)
                        : ""
                    }
                    onChange={(date: any) => {
                      if (date && date._isValid !== false) {
                        setSubtaskModalData({
                          ...subtaskModalData,
                          startDate: date,
                        });
                      }
                    }}
                    closeOnSelect={true}
                    dateFormat="MM/DD/YYYY"
                    timeFormat={false}
                    inputProps={{
                      placeholder: "Select start date...",
                      disabled: !(userRole === "0" || userRole === "50"),
                      className:
                        "w-full text-sm bg-transparent border-none text-left p-0 text-gray-900 dark:text-gray-100",
                      style: { boxShadow: "none" },
                    }}
                  />
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-orange-500"
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
                  Due Date
                </label>
                <div className="bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-sm shadow-sm hover:shadow-md transition-shadow duration-200">
                  <Datetime
                    className="w-full text-sm bg-transparent border-none p-0 m-0"
                    value={
                      subtaskModalData.dueDate
                        ? new Date(subtaskModalData.dueDate)
                        : ""
                    }
                    onChange={(date: any) => {
                      if (date && date._isValid !== false) {
                        setSubtaskModalData({
                          ...subtaskModalData,
                          dueDate: date,
                        });
                      }
                    }}
                    closeOnSelect={true}
                    dateFormat="MM/DD/YYYY"
                    timeFormat={false}
                    inputProps={{
                      placeholder: "Select due date...",
                      disabled: !(userRole === "0" || userRole === "50"),
                      className:
                        "w-full text-sm bg-transparent border-none text-left p-0 text-gray-900 dark:text-gray-100",
                      style: { boxShadow: "none" },
                    }}
                  />
                </div>
              </div>

              {/* Blocking */}
              {/* <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={subtaskModalData.isBlocking}
                  onChange={(e) =>
                    setSubtaskModalData({
                      ...subtaskModalData,
                      isBlocking: e.target.checked,
                    })
                  }
                />
                Blocking task
              </label> */}

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t-2 border-gray-200 dark:border-gray-700 mt-6">
                <button
                  onClick={() => setShowSubtaskModal(false)}
                  className="px-6 py-3 text-sm font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
                >
                  Cancel
                </button>

                <button
                  onClick={() => addSubtask()}
                  disabled={!subtaskModalData.title.trim()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold
                       rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {subtaskModalData.id ? "Update" : "Save"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
