from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak
)
from reportlab.lib.units import inch
from io import BytesIO
from typing import Dict, Any
import datetime


class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()

    def _create_custom_styles(self):
        self.styles.add(
            ParagraphStyle(
                name="ReportTitle",
                parent=self.styles["Heading1"],
                fontSize=24,
                spaceAfter=30,
                textColor=colors.HexColor("#1e293b"),
                alignment=1 
            )
        )

        self.styles.add(
            ParagraphStyle(
                name="SectionHeader",
                parent=self.styles["Heading2"],
                fontSize=16,
                spaceBefore=20,
                spaceAfter=10,
                textColor=colors.HexColor("#3b82f6"),
                borderPadding=(0, 0, 5, 0),
                borderWidth=0,
                borderColor=colors.HexColor("#e2e8f0")
            )
        )

        self.styles.add(
            ParagraphStyle(
                name="ReportBodyText",
                parent=self.styles["Normal"],
                fontSize=10,
                leading=14,
                spaceAfter=10
            )
        )

        self.styles.add(
            ParagraphStyle(
                name="StatLabel",
                parent=self.styles["Normal"],
                fontSize=9,
                textColor=colors.gray
            )
        )

        self.styles.add(
            ParagraphStyle(
                name="StatValue",
                parent=self.styles["Normal"],
                fontSize=12,
                fontName="Helvetica-Bold"
            )
        )

    def generate_report(self, data: Dict[str, Any]) -> BytesIO:
        buffer = BytesIO()

        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72,
            title=f"Analysis Report - {data.get('meta', {}).get('filename', 'Usage')}"
        )


        story = []

        meta = data.get("meta", {})
        dashboard = data.get("dashboard_data", {})
        report = data.get("report_data", {})
        stats = dashboard.get("general_stats", {})

        # ---------- Title Page ----------
        story.append(Paragraph("Analysis Report", self.styles["ReportTitle"]))
        story.append(Spacer(1, 12))

        story.append(
            Paragraph(
                f"<b>Filename:</b> {meta.get('filename', 'N/A')}",
                self.styles["ReportBodyText"]
            )
        )

        story.append(
            Paragraph(
                f"<b>Date:</b> {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}",
                self.styles["ReportBodyText"]
            )
        )

        story.append(Spacer(1, 24))

        # ---------- Key Metrics ----------
        metric_data = [
            [
                f"{stats.get('word_count', 0):,} Words",
                f"{stats.get('sentence_count', 0):,} Sentences",
                f"Lang: {stats.get('language', 'N/A').upper()}",
                f"Net Sentiment: {report.get('net_sentiment_score', 0)}"
            ]
        ]

        metrics_table = Table(metric_data, colWidths=[110, 110, 110, 110])
        metrics_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
                ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#0f172a")),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
                ("GRID", (0, 0), (-1, -1), 1, colors.white),
            ])
        )

        story.append(metrics_table)
        story.append(Spacer(1, 30))

        # ---------- 1. Executive Summary ----------
        story.append(Paragraph("1. Executive Summary", self.styles["SectionHeader"]))
        story.append(
            Paragraph(
                report.get("ai_summary", "No summary available."),
                self.styles["ReportBodyText"]
            )
        )

        # ---------- 2. Topic Analysis ----------
        story.append(Paragraph("2. Topic Analysis", self.styles["SectionHeader"]))

        topics = dashboard.get("topics", [])
        if topics:
            table_data = [["Topic Name", "Keywords", "Prevalence"]]

            for topic in topics:
                keywords = ", ".join(
                    [k["word"] for k in topic.get("keywords", [])[:3]]
                )

                table_data.append([
                    Paragraph(topic.get("title", ""), self.styles["Normal"]),
                    Paragraph(keywords, self.styles["Normal"]),
                    f"{topic.get('prevalence', 0)}%"
                ])

            topics_table = Table(table_data, colWidths=[150, 200, 80])
            topics_table.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#3b82f6")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),

                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, 0), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                    ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
                    ("GRID", (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
                ])
            )

            story.append(topics_table)
        else:
            story.append(
                Paragraph("No topics identified.", self.styles["ReportBodyText"])
            )

        # ---------- 3. Strategic Insights ----------
        story.append(Paragraph("3. Strategic Insights", self.styles["SectionHeader"]))

        insights = report.get("strategic_insights", {})
        if insights:
             for key, val in insights.items():
                 # Handle dictionary values (label/score) gracefully
                 if isinstance(val, dict):
                     display_val = f"{val.get('label', 'N/A')} ({val.get('score', 0):.2f})"
                 else:
                     display_val = str(val)
                 
                 story.append(Paragraph(f"<b>{key.replace('_', ' ').title()}:</b> {display_val}", self.styles["ReportBodyText"]))

        else:
             story.append(Paragraph("No strategic insights available.", self.styles["ReportBodyText"]))

        story.append(PageBreak())

        # ---------- 4. Risks & Opportunities ----------
        story.append(Paragraph("4. Risks & Opportunities", self.styles["SectionHeader"]))
        risks = report.get("risks_and_opportunities", [])
        if risks:
            for r in risks:
                # Format if it's a dict (expected) or string
                if isinstance(r, dict):
                    text = f"<b>[{r.get('type', 'Risk')} - {r.get('level', 'Medium')}]</b> {r.get('text', '')}"
                else:
                    text = f"• {r}"
                story.append(Paragraph(text, self.styles["ReportBodyText"]))

        else:
             story.append(Paragraph("No specific risks identified.", self.styles["ReportBodyText"]))

        # ---------- 5. Urgency & Highlights ----------
        story.append(Paragraph("5. Urgency & Highlights", self.styles["SectionHeader"]))
        urgency = report.get("urgency_score", 0)
        badge = report.get("decision_badge", "Low Priority")
        story.append(Paragraph(f"<b>Urgency Score:</b> {urgency}/10 ({badge})", self.styles["ReportBodyText"]))
        
        highlights = report.get("highlights", [])
        if highlights:
            story.append(Spacer(1, 10))
            story.append(Paragraph("<b>Key Highlights:</b>", self.styles["ReportBodyText"]))
            for h in highlights:
                story.append(Paragraph(f"- {h}", self.styles["ReportBodyText"]))

        # ---------- 6. Sentiment Overview ----------
        story.append(Paragraph("6. Sentiment Overview", self.styles["SectionHeader"]))


        sentiment = dashboard.get("overall_sentiment", {})
        story.append(
            Paragraph(
                f"Positive: {int(sentiment.get('positive', 0) * 100)}% | "
                f"Neutral: {int(sentiment.get('neutral', 0) * 100)}% | "
                f"Negative: {int(sentiment.get('negative', 0) * 100)}%",
                self.styles["ReportBodyText"]
            )
        )

        # ---------- 7. Recommendations ----------
        story.append(Paragraph("7. Key Recommendations", self.styles["SectionHeader"]))


        recommendations = report.get("recommendations", [])
        if recommendations:
            for rec in recommendations:
                story.append(
                    Paragraph(f"• {rec}", self.styles["ReportBodyText"])
                )
        else:
            story.append(
                Paragraph(
                    "No specific recommendations generated.",
                    self.styles["ReportBodyText"]
                )
            )

        # ---------- Footer ----------
        story.append(Spacer(1, 40))
        story.append(
            Paragraph("Generated by ReCreative AI", self.styles["StatLabel"])
        )

        doc.build(story)
        buffer.seek(0)

        return buffer
