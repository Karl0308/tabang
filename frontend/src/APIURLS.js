const getBaseURL = () => {
  const company = localStorage.getItem("company");
  // return `https://etlabs.dev/ticketappgw/${company ?? ""}/`;
  return `https://localhost:7171/`;
  // return `https://tabangapi.azurewebsites.net/`;
};

export const APIURLS = {
  ticket: {
    ticketBase: () => getBaseURL() + 'api/Ticket/',
    getTickets: () => getBaseURL() + 'api/ticket/gettickets',
    getTickets2: () => getBaseURL() + 'api/ticket/gettickets2',
    getTicketSearch: () => getBaseURL() + 'api/ticket/getTicketSearch?search=',
    updateTicket: () => getBaseURL() + 'api/Ticket/UpdateTicket',
    saveTicket: () => getBaseURL() + 'api/Ticket/SaveTicket',
    getTicketNum: () => getBaseURL() + 'api/Ticket/GetTicketNum?ticketNum=',
    getTicketHistoriesById: () => getBaseURL() + 'api/Ticket/GetTicketHistoriesById?_ticketId=',
    getTicketCommentsById: () => getBaseURL() + 'api/Ticket/GetTicketCommentsById?_ticketId=',
    getTicketRelatedIssuesById: () => getBaseURL() + 'api/Ticket/getTicketRelatedIssuesById?_ticketId=',
    getTicketAttachmentById: () => getBaseURL() + 'api/Ticket/getTicketAttachmentById?_ticketId=',
    getAttachmentById: () => getBaseURL() + 'api/Ticket/getAttachmentById?_attachmentId=',
    saveTicketComment: () => getBaseURL() + 'api/Ticket/SaveTicketComment',
    saveStarRating: () => getBaseURL() + 'api/Ticket/SaveStarRating?',
    saveTicketProp: () => getBaseURL() + 'api/Ticket/saveTicketProp?',
    saveTicketLink: () => getBaseURL() + 'api/Ticket/addLinkTicket',
    editComment: () => getBaseURL() + 'api/Ticket/EditComment?',
    deleteComment: () => getBaseURL() + 'api/Ticket/DeleteComment?',
    catchup: () => getBaseURL() + 'api/Ticket/Catchup?',
    getTicketCatchup: () => getBaseURL() + 'api/Ticket/getTicketCatchup?ticketId=',
    deleteTicketAsset: () => getBaseURL() + 'api/Ticket/DeleteTicketAsset/',
    GetTicketAsset: () => getBaseURL() + 'api/Ticket/GetTicketAsset/',
    GetAdditionalAssigneeByTicketId: () => getBaseURL() + 'api/Ticket/GetAdditionalAssigneeByTicketId?ticketId=',
    AddAdditionalAssignee: () => getBaseURL() + 'api/Ticket/AddAdditionalAssignee',
    RemoveAdditionalAssignee: () => getBaseURL() + 'api/Ticket/RemoveAdditionalAssignee',
    AddRemoveDepartment: () => getBaseURL() + 'api/Ticket/AddRemoveDepartment',
    
  },
  ticketEng: {
    ticketBase: () => getBaseURL() + "api/ticketEng/",
    getTickets: () => getBaseURL() + "api/ticketEng/gettickets",
    getTicketSearch: () => getBaseURL() + "api/ticketEng/getTicketSearch?search=",
    updateTicket: () => getBaseURL() + "api/ticketEng/UpdateTicket",
    saveTicket: () => getBaseURL() + "api/ticketEng/SaveTicket",
    getTicketNum: () => getBaseURL() + "api/ticketEng/GetTicketNum?ticketNum=",
    getTicketHistoriesById: () => getBaseURL() + "api/ticketEng/GetTicketHistoriesById?_ticketId=",
    getTicketCommentsById: () => getBaseURL() + "api/ticketEng/GetTicketCommentsById?_ticketId=",
    getTicketRelatedIssuesById: () => getBaseURL() + "api/ticketEng/getTicketRelatedIssuesById?_ticketId=",
    getTicketAttachmentById: () => getBaseURL() + "api/ticketEng/getTicketAttachmentById?_ticketId=",
    getAttachmentById: () => getBaseURL() + "api/ticketEng/getAttachmentById?_attachmentId=",
    saveTicketComment: () => getBaseURL() + "api/ticketEng/SaveTicketComment",
    saveStarRating: () => getBaseURL() + "api/ticketEng/SaveStarRating?",
    saveTicketProp: () => getBaseURL() + "api/ticketEng/saveTicketProp?",
    saveTicketLink: () => getBaseURL() + "api/ticketEng/addLinkTicket",
    editComment: () => getBaseURL() + "api/ticketEng/EditComment?",
    deleteComment: () => getBaseURL() + "api/ticketEng/DeleteComment?",
    catchup: () => getBaseURL() + "api/ticketEng/Catchup?",
    getTicketCatchup: () => getBaseURL() + "api/ticketEng/getTicketCatchup?ticketId=",
    deleteTicketAsset: () => getBaseURL() + "api/ticketEng/DeleteTicketAsset/",
    GetTicketAsset: () => getBaseURL() + "api/ticketEng/GetTicketAsset/"
  },
  user: {
    getUsers: () => getBaseURL() + "api/User/GetUsers",
    getUserEng: () => getBaseURL() + "api/UserEng/GetUsers",
    getAllUserAssignees: () => getBaseURL() + "api/User/GetAllUserAssignees",
    saveUsers: () => getBaseURL() + "api/User/SaveUser",
    saveUser: () => getBaseURL() + "api/Auth/CreateUser",
    getUserId: () => getBaseURL() + "api/User/GetUserId?id=",
    login: () => getBaseURL() + "api/Auth/Login",
    loginEmail: () => getBaseURL() + "api/Auth/LoginEmail",
    updateUser: () => getBaseURL() + "api/Auth/UpdateUser",
    resetPassword: () => getBaseURL() + "api/User/ResetPassword",
    getUserSignature: () => getBaseURL() + "api/User/GetUserSignatureById?_userId=",
    getUsersSignatureOvertime: () => getBaseURL() + "api/User/GetUsersSignatureOvertime?id=",
    deleteUser: () => getBaseURL() + "api/Auth/Delete/",
    resetUserPassword: () => getBaseURL() + "api/User/resetUserPassword",
  },
  branch: {
    getBranches: () => getBaseURL() + "api/branch/GetBranches",
    getBranchesEng: () => getBaseURL() + "api/branchEng/GetBranches",
    saveBranch: () => getBaseURL() + "api/branch/SaveBranch",
    deleteBranch: () => getBaseURL() + "api/branch/Delete/",
    addBranchMember: () => getBaseURL() + "api/branch/SaveBranchMember/",
    deleteBranchMember: () => getBaseURL() + "api/branch/deleteBranchMember?",
  },

  documenttype: {
    getDocumentTypes: () => getBaseURL() + "api/documentType/GetDocumentTypes?isAll=",
    saveDocumentType: () => getBaseURL() + "api/documentType/SaveDocumentType",
    deleteDocumentType: () => getBaseURL() + "api/documentType/Delete/",
  },

  notification: {
    getNotifications: () => getBaseURL() + "api/notification/GetNotifications?userId=",
    readNotifications: () => getBaseURL() + "api/notification/ReadNotification?notifId=",
  },

  groups: {
    getSubDepartments: () => getBaseURL() + "api/department/GetSubDepartments",
    saveSaveSubDepartment: () => getBaseURL() + "api/department/SaveSubDepartment",
    addMember: () => getBaseURL() + "api/department/addMember",
    removeMember: () => getBaseURL() + "api/department/removeMember?_memberId=",
    setSupervisor: () => getBaseURL() + "api/department/setSupervisor?_memberId=",
  },

  overtime: {
    getOvertimes: () => getBaseURL() + "api/overtime/GetOvertimes?_supId=",
    saveOvertime: () => getBaseURL() + "api/overtime/SaveOvertime",
    approveOvertime: () => getBaseURL() + "api/overtime/approveOvertime?",
  },

  appsetting: {
    saveAppSetting: () => getBaseURL() + "api/appsetting/SaveAppSetting",
    getAppSettings: () => getBaseURL() + "api/appsetting/GetAppSettings",
  },

  asset: {
    getAssets: () => getBaseURL() + "api/Assets/GetAssets",
    getAssetTags: () => getBaseURL() + "api/Assets/GetAssetTags",
    deleteAsset: () => getBaseURL() + "api/Assets/Delete/",
    getAssetById: () => getBaseURL() + "api/Assets/GetAsset/",
    addAsset: () => getBaseURL() + "api/Assets/AddAsset",
    editAsset: () => getBaseURL() + "api/Assets/EditAsset",
    getAssetTagByTicketId: () => getBaseURL() + "api/Assets/GetAssetTagByTicketId/",
    deleteTicketAsset: () => getBaseURL() + "api/Assets/DeleteTicketAsset/",
  },

  report: {
    getReports: () => getBaseURL() + "api/Report/GetReports/",
    getAverageReports: () => getBaseURL() + "api/Report/GetAverageReports/",
    getAverageResolutionReports: () => getBaseURL() + "api/Report/GetAverageResolutionReports/",
    getSuppliesHistory: () => getBaseURL() + "api/Report/GetSuppliesHistory/",
  },

  categories: {
    getCategories: () => getBaseURL() + "api/Category/GetCategories",
    saveCategory: () => getBaseURL() + "api/Category/SaveCategory",
    deleteCategory: () => getBaseURL() + "api/Category/Delete/",
  },

  itemStocks: {
    getItemStocks: () => getBaseURL() + "api/ItemStock/getItemStocks",
    saveItemStocks: () => getBaseURL() + "api/ItemStock/saveItemStock",
    updateItemStockSupply: () => getBaseURL() + "api/ItemStock/updateItemStockSupply",
    deleteItemStocks: () => getBaseURL() + "api/ItemStock/deleteItemStock/",
    getItemStocksByTicket: () => getBaseURL() + "api/ItemStock/getItemStocksByTicket/search/",
    searchItemStocks: () => getBaseURL() + "api/ItemStock/searchItemStocks/search/",
  },

    departments: {
    getDepartments: () => getBaseURL() + "api/Department/GetDepartments",
    saveDepartment: () => getBaseURL() + "api/Department/SaveDepartment",
    deleteDepartment: () => getBaseURL() + "api/Department/Delete/",
  },

    workstream: {
    getWorkstreams: () => getBaseURL() + 'api/Workstream/GetWorkstreams',
    saveWorkstream: () => getBaseURL() + 'api/Workstream/SaveWorkstream',
    getWorkstreamNum: () => getBaseURL() + 'api/Workstream/GetWorkstreamNum?workstreamNum=',
    saveWorkstreamProp: () => getBaseURL() + 'api/Workstream/saveWorkstreamProp?',
    getWorkstreamHistoriesById: () => getBaseURL() + 'api/Workstream/GetWorkstreamHistoriesById?_workstreamId=',
    addSubtask: () => getBaseURL() + 'api/Workstream/AddSubtask',
    getWorkstreamSubtaskByWorkstreamId: () => getBaseURL() + 'api/Workstream/GetWorkstreamSubtaskByWorkstreamId?workstreamId=',
    getWorkstreamTicketByWorkstreamId: () => getBaseURL() + 'api/Workstream/GetWorkstreamTicketByWorkstreamId?workstreamId=',
    addLinkTicket: () => getBaseURL() + 'api/Workstream/AddLinkTicket',
    removeLinkTicket: () => getBaseURL() + 'api/Workstream/RemoveLinkTicket',

  },

};
