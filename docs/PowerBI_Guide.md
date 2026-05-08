# Power BI Strategic Audit Linkage Guide: Connecting Laptop 2

This guide walks through how to export your paper-trading ledger from the **Sovereign Vault (`/portfolio`)** on Apex Alpha (Laptop 1) and link it directly to **Microsoft Power BI Desktop (Laptop 2)** to run complete multi-dimensional forensic risk audits.

---

## 🛠️ Step 1: Export Trade Ledger CSV
1. Navigate to the **Sovereign Vault** (`/portfolio` or `/vault` route) on Apex Alpha.
2. Under the **Ledger** or **Trade History** section, click the **Export CSV** button.
3. This downloads a file named `apex_trading_ledger.csv` containing fields:
   * `id`: Unique trade identifier
   * `symbol`: Asset ticker (e.g., `BTC-USD`, `ETH-USD`)
   * `type`: Trade direction (`BUY` / `SELL`)
   * `leverage`: Sizing leverage factor (e.g., `10x`, `50x`)
   * `entryPrice`: Absolute entry coordinate
   * `closePrice`: Execution close coordinate
   * `pnl`: Cumulative net profitability
   * `timestamp`: Absolute UNIX/ISO execution time

---

## 🖥️ Step 2: Establish Connection in Power BI Desktop (Laptop 2)
1. Launch **Microsoft Power BI Desktop** on Laptop 2.
2. In the **Home** ribbon tab, click on **Get Data** and select **Text/CSV**.
3. Locate and select your downloaded `apex_trading_ledger.csv` file.
4. Review the data preview pane. Ensure that:
   * **File Origin** is set to `65001: Unicode (UTF-8)`.
   * **Delimiter** is set to `Comma`.
5. Click **Transform Data** to open the **Power Query Editor** to refine schema fields.

---

## 🧹 Step 3: Power Query Transformations (Recommended)
Inside Power Query Editor, verify and format the column types:
1. **PNL Format**: Ensure the `pnl` column is classified as a **Decimal Number** so yield calculations accumulate correctly.
2. **Leverage Extract**: If `leverage` contains the `x` suffix (e.g., `50x`), select the column, click **Replace Values**, replace `x` with empty string `""`, and change the data type to **Whole Number** to enable average leverage aggregations.
3. **Timestamp parse**: Parse the `timestamp` column as **Date/Time** or **Date** to build time-series equity curves.
4. Click **Close & Apply** inside the top-left ribbon to load the dataset.

---

## 📊 Step 4: Constructing the Strategic Audit Dashboard
With the dataset loaded, you can now construct three vital institutional-grade visual panels:

### 1. Cumulative Equity Curve (Time Series Area Chart)
* **X-Axis**: `timestamp`
* **Y-Axis**: Cumulative sum of `pnl`
* *Purpose*: Evaluates equity trajectory and drawdowns over consecutive trading sessions.

### 2. Risk Squeeze Heatmap (Scatter Chart)
* **X-Axis**: `leverage`
* **Y-Axis**: `pnl` (absolute value or percentage)
* *Purpose*: Pinpoints whether high-leverage positions correlate with critical losses or liquidation exposure.

### 3. Win/Loss Distribution Matrix (Treemap or Pie)
* **Value**: Count of `id`
* **Legend**: Group by conditional column `Outcome` (where `pnl` > 0 is `WIN` and `pnl` < 0 is `LOSS`).
* *Purpose*: Visually checks the system's win-rate ratio in a single glance.
