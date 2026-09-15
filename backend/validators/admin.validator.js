export const validateBanUser = (req, res, next)=>{
    const {reason} = req.body;

      if (!reason || typeof reason !== "string") {
    return res.status(400).json({
      success: false,
      message: "Ban reason is required."
    });
  }

    const trimmedReason = reason.trim();

      if (trimmedReason.length < 3) {
    return res.status(400).json({
      success: false,
      message: "Ban reason must be at least 3 characters."
    });
  }

  if (trimmedReason.length > 300) {
    return res.status(400).json({
      success: false,
      message: "Ban reason cannot exceed 300 characters."
    });
  }

  req.body.reason = trimmedReason;

  next();
}
export const validateReportStatus = (req, res, next) => {
  const { status } = req.body;

  const allowedStatuses = [
    "REVIEWING",
    "RESOLVED",
    "REJECTED"
  ];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid report status."
    });
  }

  next();
};


export const validateCreateAdmin = (req, res, next) => {
  const { userId } = req.body;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({
      success: false,
      message: "userId is required."
    });
  }

  next();
};