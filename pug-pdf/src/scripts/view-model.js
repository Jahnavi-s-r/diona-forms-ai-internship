/**
 * view-model.js
 *
 * Takes the raw request JSON (same shape a real intake system would send)
 * and turns it into a flat, pre-formatted object that the Pug template can
 * render with zero logic of its own. Keeping formatting/business-rules here
 * (plain JS, easy to unit test) rather than inside the template keeps the
 * .pug file readable and matches the same choice lists used in the XLSForm,
 * so the two exercises describe the same form.
 */

const ID_TYPE_LABELS = {
  birth_certificate: "Birth Certificate",
  sin_card: "Social Insurance Card",
  mb_health_card: "Manitoba Health Card",
  treaty_card: "Treaty Card",
  mb_dl: "MB Driver's Licence with Photo",
  other: "Other",
};

const REASON_LABELS = {
  child_protection_concerns: "Child Protection Concerns",
  place_of_safety: "Place of Safety",
  kinship_customary_care: "Kinship or Customary Care Agreement",
};

const REASON_REQUIRES_CONSENT = new Set(["place_of_safety", "kinship_customary_care"]);

const GENDER_LABELS = { male: "Male", female: "Female" };

function formatDate(isoDate) {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
}

function buildViewModel(data) {
  const consent = data.consent || {};
  const identity = data.identity || {};
  const idVerification = data.idVerification || {};
  const request = data.request || {};

  const isConsented = consent.status === "consented";
  const idTypes = idVerification.types || [];
  const reasonRequiresConsent = REASON_REQUIRES_CONSENT.has(request.reason);
  const showConsentWarning = reasonRequiresConsent && !isConsented;

  return {
    consent: {
      isConsented,
      isUnconsented: !isConsented,
      dateFormatted: formatDate(consent.date),
      witnessName: consent.witnessName || "",
      signatureLabel: consent.signatureLabel || "",
    },
    identity: {
      firstName: identity.firstName || "",
      secondName: identity.secondName || "",
      lastName: identity.lastName || "",
      fullName: [identity.firstName, identity.lastName].filter(Boolean).join(" "),
      dateOfBirthFormatted: formatDate(identity.dateOfBirth),
      genderLabel: GENDER_LABELS[identity.gender] || "",
      isMale: identity.gender === "male",
      isFemale: identity.gender === "female",
      otherLastNames: identity.otherLastNames || "",
      otherFirstNames: identity.otherFirstNames || "",
      currentAddress: identity.currentAddress || "",
      currentPhone: identity.currentPhone || "",
      birthPlace: identity.birthPlace || "",
    },
    idVerification: {
      hasBirthCertificate: idTypes.includes("birth_certificate"),
      hasSinCard: idTypes.includes("sin_card"),
      hasMbHealthCard: idTypes.includes("mb_health_card"),
      hasTreatyCard: idTypes.includes("treaty_card"),
      hasMbDl: idTypes.includes("mb_dl"),
      hasOther: idTypes.includes("other"),
      otherSpecify: idVerification.otherSpecify || "",
      mbDlLicenceNumber: idVerification.mbDlLicenceNumber || "",
      selectedLabels: idTypes.map((t) => ID_TYPE_LABELS[t] || t),
      meetsTwoIdRequirement: idTypes.length >= 2,
    },
    request: {
      agencyName: request.agencyName || "",
      reasonLabel: REASON_LABELS[request.reason] || "",
      isChildProtectionConcerns: request.reason === "child_protection_concerns",
      isPlaceOfSafety: request.reason === "place_of_safety",
      isKinshipCustomaryCare: request.reason === "kinship_customary_care",
      assignedWorker: request.assignedWorker || "",
      lastAssessmentDateFormatted: formatDate(request.lastAssessmentDate),
      submittingDesignate: request.submittingDesignate || "",
      designatePhone: request.designatePhone || "",
      designateEmail: request.designateEmail || "",
      designateFax: request.designateFax || "",
      requestDateFormatted: formatDate(request.requestDate),
      showConsentWarning,
    },
  };
}

module.exports = { buildViewModel, formatDate };
