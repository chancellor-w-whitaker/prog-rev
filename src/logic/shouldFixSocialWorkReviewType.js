export const shouldFixSocialWorkReviewType = ({ field, data }) =>
  field === "Review Type" && data["Program Title"] === "Social Work";
