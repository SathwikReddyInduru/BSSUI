export const PRIVILEGES = {

    // Voucher Profile Category
    CREATE_CATEGORY: "P273",
    MODIFY_CATEGORY: "P273",

    // Voucher Profile
    CREATE_VOUCHER_PROFILE: "P251",
    MODIFY_VOUCHER_PROFILE: "P251",

    // Voucher Profile Approve / Reject
    APPROVE_REJECT_VOUCHER_PROFILE: "P267",

    // Purchase Order
    CREATE_PURCHASE_ORDER: "P252",
    APPROVE_REJECT_PO: "P253",
    GENERATE_PO: "P254",
    CANCEL_PO: "P258",
    PO_HISTORY: "P255",

    // Voucher Activate / Deactivate
    VOUCHER_ACTIVATE: "P269",
    VOUCHER_DEACTIVATE: "P269",

    // Voucher Search
    VOUCHER_SEARCH: "P270",

    // Voucher Mapping / GST Profile Update
    VOUCHER_MAPPING_TARIFF: "P276",
    GST_PROFILE_UPDATE: "P276",

    // Expired Vouchers
    EXPIRED_VOUCHERS: "P291",


    // Upload MSISDN
    UPLOAD_MSISDN: "P292",

//vendor
    VIEW_VENDOR: "P221",
    MODIFY_VENDOR: "P222",
    GOODS_RECEIPT: "P235",
};

export const hasPrivilege = (privileges, privilegeId) => {
    return (privileges || []).some(
        (p) =>
            p === privilegeId ||
            p?.privilegeId === privilegeId ||
            p?.privilege_code === privilegeId ||
            p?.privilegeCode === privilegeId
    );

};