export async function extractCertificateDetails(file, setProgress = () => {}) {
  if (!file) {
    throw new Error('No file provided')
  }

  setProgress(5)

  // This is a minimal fallback implementation.
  // It returns empty certificate fields until OCR/AI parsing is wired in.
  await new Promise((resolve) => setTimeout(resolve, 50))
  setProgress(30)
  await new Promise((resolve) => setTimeout(resolve, 50))
  setProgress(70)
  await new Promise((resolve) => setTimeout(resolve, 50))

  setProgress(100)

  return {
    recipientName: null,
    institution: null,
    courseTitle: null,
    date: null,
    suggestedLabel: '',
  }
}
