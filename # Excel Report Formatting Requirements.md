# Excel Report Formatting Requirements

## PROJECT REPORT

### Worksheet Settings

1. Use **Calibri** font.
2. Use **Font Size 11**.
3. Header row must have:

   * Black background (#000000)
   * White font color (#FFFFFF)
4. All data cells must be **Left Align** and **Top Align**, except the **No.** column.
5. The **No.** column must be **Center Align** and **Top Align**.
6. Apply **All Borders** to the entire data range.
7. Enable **Wrap Text** for the following columns:

   * Project Name
   * Project Description
   * External Program
   * Internal Program
   * Team Member
8. Add a report title section containing:

   * IT PROJECT PORTFOLIO
   * Generated Date & Time
9. Header text must be in **UPPERCASE** and have a row height of **50 pixels**.
10. Date fields such as:

    * Target Live Date
    * Register Date
    * Closed Date
      must use the format **dd-mmm-yy**.
11. Add a Status Legend using the following colors:

| Status             | Color   |
| ------------------ | ------- |
| CANCELED           | #C00000 |
| CLOSED             | #00B050 |
| COMPLETED          | #92D050 |
| DECLINED           | #FF0000 |
| INITIATING         | #FFFF00 |
| RUNNING            | #00B0F0 |
| TEMPORARY CLOSED   | #FFC000 |
| WAITING APPROVAL 1 | #FFFFFF |
| WAITING APPROVAL 2 | #FFFFFF |
| WAITING APPROVAL 3 | #FFFFFF |

12. Set the worksheet name to:
    **IT Project Portfolio Report**

---

## RFC REPORT

### Worksheet Settings

1. Use **Calibri** font.
2. Use **Font Size 11**.
3. Header row must have:

   * Black background (#000000)
   * White font color (#FFFFFF)
4. All data cells must be **Left Align** and **Top Align**, except the **No.** column.
5. The **No.** column must be **Center Align** and **Top Align**.
6. Apply **All Borders** to the entire data range.
7. Enable **Wrap Text** for the following columns:

   * Project Name
   * Project Description
   * External Program
   * Internal Program
   * Team Member
8. Add a report title section containing:

   * IT RFC PORTFOLIO
   * Generated Date & Time
9. Header text must be in **UPPERCASE** and have a row height of **50 pixels**.
10. Date fields such as:

    * Target Live Date
    * Register Date
    * Closed Date
      must use the format **dd-mmm-yy**.
11. Add a Status Legend using the following colors:

| Status           | Color   |
| ---------------- | ------- |
| CANCELED         | #C00000 |
| CLOSED           | #00B050 |
| COMPLETED        | #92D050 |
| DECLINED         | #FF0000 |
| INITIATING       | #FFFF00 |
| RUNNING          | #00B0F0 |
| TEMPORARY CLOSED | #FFC000 |

12. Set the worksheet name to:
    **IT RFC Portfolio Report**

---

## Output File Requirements

1. The generated filename must follow this format:

   `Project_Portfolio_Report_YYYY-MM-DD_HH-mm-ss.xlsx`

   Example:
   `Project_Portfolio_Report_2026-06-23_14-35-42.xlsx`

2. Protect the workbook and worksheets to prevent users from modifying:

   * Cell values
   * Formatting
   * Worksheet structure

3. The workbook should open in read-only/protected mode while still allowing users to view, filter, and sort data if required.
