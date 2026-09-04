const validateSurveyForPublish = (survey) => {
  if (!survey.title?.trim()) {
    return "Survey title is required";
  }

  if (!survey.description?.trim()) {
    return "Survey description is required";
  }

  if (!survey.questions || survey.questions.length === 0) {
    return "At least one question is required";
  }

  for (const question of survey.questions) {
    if (!question.text?.trim()) {
      return "Every question must have text";
    }

    if (
      ["SINGLE_CHOICE", "MULTIPLE_CHOICE"].includes(
        question.type
      ) &&
      question.options.length < 2
    ) {
      return "Choice questions must have at least 2 options";
    }
  }

  if (!survey.location?.city) {
    return "Survey location is required";
  }

  if (
    survey.location.latitude === undefined ||
    survey.location.longitude === undefined
  ) {
    return "Survey coordinates are required";
  }

  if (!survey.startTime || !survey.endTime) {
    return "Start and end time are required";
  }

  if (survey.endTime <= survey.startTime) {
    return "End time must be after start time";
  }

  if (survey.startTime <= new Date()) {
    return "Start time must be in the future";
  }

  return null;
};

module.exports = validateSurveyForPublish;