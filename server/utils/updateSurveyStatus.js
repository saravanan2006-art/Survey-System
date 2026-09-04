const updateSurveyStatus = async (survey) => {
  const now = new Date();

  if (
    survey.status === "PUBLISHED" &&
    now > survey.endTime
  ) {
    survey.status = "COMPLETED";
    await survey.save();
  }

  return survey;
};

module.exports = updateSurveyStatus;