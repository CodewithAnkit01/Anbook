const allowedTargetTypes = [
  "USER",
  "POST",
  "COMMENT",
];

const allowedReasons = [
  "SPAM",
  "HARASSMENT",
  "HATE_SPEECH",
  "VIOLENCE",
  "SEXUAL_CONTENT",
  "MISINFORMATION",
  "OTHER",
];

export const validateReport = (
  req,
  res,
  next
) => {
  const {
    targetType,
    targetId,
    reason,
    description,
  } = req.body;

  // Target type
  if (!targetType) {
    return res.status(400).json({
      success: false,
      message: "Target type is required.",
    });
  }

  if (!allowedTargetTypes.includes(targetType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid target type.",
    });
  }

  // Target ID
  if (!targetId || typeof targetId !== "string") {
    return res.status(400).json({
      success: false,
      message: "Valid target ID is required.",
    });
  }

  // Reason
  if (!reason) {
    return res.status(400).json({
      success: false,
      message: "Report reason is required.",
    });
  }

  if (!allowedReasons.includes(reason)) {
    return res.status(400).json({
      success: false,
      message: "Invalid report reason.",
    });
  }

  // Description
  if (
    description &&
    typeof description !== "string"
  ) {
    return res.status(400).json({
      success: false,
      message: "Description must be a string.",
    });
  }

  if (
    description &&
    description.trim().length > 1000
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Description cannot exceed 1000 characters.",
    });
  }

  next();
};