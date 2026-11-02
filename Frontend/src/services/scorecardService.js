import api from "./api";
import jsPDF from "jspdf";

export const createScorecard = (data) =>
  api.post("/scorecards", data);

export const getScorecard = (id) =>
  api.get(`/scorecards/${id}`);

export const getRoomScorecards = (roomId) =>
  api.get(`/scorecards/room/${roomId}`);

export const submitScorecard = (id) =>
  api.put(`/scorecards/${id}/submit`);

export const exportScorecardPDF = (scorecard) => {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Header
  doc.setFontSize(20);
  doc.text("Interview Scorecard", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Candidate info
  doc.setFontSize(12);
  doc.text(`Candidate: ${scorecard.candidate?.name}`, 20, yPosition);
  yPosition += 8;
  doc.text(
    `Date: ${new Date(scorecard.createdAt).toLocaleDateString()}`,
    20,
    yPosition
  );
  yPosition += 12;

  // Scores
  doc.setFontSize(14);
  doc.text("Scores", 20, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  const scoreText = [
    `Overall Score: ${scorecard.overallScore}/100 (Grade: ${scorecard.grade})`,
    `Code Quality: ${scorecard.codeQualityScore}/100`,
    `Readability: ${scorecard.readabilityScore}/100`,
    `Efficiency: ${scorecard.efficiencyScore}/100`,
    `Tests Passed: ${scorecard.passedTestCases}/${scorecard.totalTestCases}`,
  ];

  scoreText.forEach((text) => {
    doc.text(text, 20, yPosition);
    yPosition += 8;
  });

  yPosition += 5;

  // Remarks
  if (scorecard.remarks) {
    doc.setFontSize(12);
    doc.text("Remarks", 20, yPosition);
    yPosition += 8;
    doc.setFontSize(10);
    const remarksLines = doc.splitTextToSize(scorecard.remarks, 170);
    remarksLines.forEach((line) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
  }

  doc.save(
    `scorecard_${scorecard.candidate?.name}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
};
