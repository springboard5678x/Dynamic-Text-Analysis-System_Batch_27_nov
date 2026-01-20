// InsightEngine: Employee Voice Analytics - Vanilla JavaScript

;(() => {
  // ==================== DATA ====================
  let reviewsData = [];
  
  const ITEMS_PER_PAGE = 5

  // ==================== STATE ====================
  let currentState = "upload" 
  let theme = "light"
  let selectedFileName = null
  let currentPage = 1

  // ==================== DOM ELEMENTS ====================
  const appContainer = document.getElementById("app-container")
  const themeToggle = document.getElementById("theme-toggle")
  const uploadState = document.getElementById("upload-state")
  const loadingState = document.getElementById("loading-state")
  const dashboardState = document.getElementById("dashboard-state")
  const dropzone = document.getElementById("dropzone")
  const fileInput = document.getElementById("file-input")
  const fileSelected = document.getElementById("file-selected")
  const fileNameSpan = document.getElementById("file-name")
  const analyzeBtn = document.getElementById("analyze-btn")
  const tableBody = document.getElementById("table-body")
  const paginationInfo = document.getElementById("pagination-info")
  const prevBtn = document.getElementById("prev-btn")
  const nextBtn = document.getElementById("next-btn")
  
  // PDF Button
  const downloadBtn = document.getElementById("download-btn");

  // --- Elements for Dashboard Updates ---
  const metricsElements = {
    total: document.getElementById("total-reviews-val"),
    positive: document.getElementById("positive-pct-val"),
    topic: document.getElementById("top-topic-val"),
  };
  const chartElements = {
    donut: document.querySelector(".ie-donut-chart"),
    bars: document.querySelectorAll(".ie-bar-item"),
  };

  // ==================== VISUAL HELPERS ====================
  function animateCharts() {
    // Animate Bar Charts
    const bars = document.querySelectorAll('.ie-bar-item');
    bars.forEach(bar => {
      const fill = bar.querySelector('.ie-bar-fill');
      const currentWidth = fill.style.width || '0%'; 
      fill.style.width = '0%';
      setTimeout(() => {
        fill.style.width = currentWidth; 
      }, 100);
    });
  }

  // ==================== DASHBOARD LOGIC ====================
  function updateDashboard(stats) {
    if (!stats) return;

    // 1. Update Key Metrics
    if (metricsElements.total) metricsElements.total.textContent = stats.total_reviews.toLocaleString();
    if (metricsElements.positive) metricsElements.positive.textContent = `${stats.positive_pct}%`;
    if (metricsElements.topic) metricsElements.topic.textContent = stats.top_topic;

    // 2. Update Donut Chart
    if (chartElements.donut) {
      const pos = stats.sentiment_counts.Positive || 0;
      const neu = stats.sentiment_counts.Neutral || 0;
      const neg = stats.sentiment_counts.Negative || 0;
      const total = stats.total_reviews || 1;

      const posPct = Math.round((pos / total) * 100);
      const neuPct = Math.round((neu / total) * 100);
      const negPct = Math.round((neg / total) * 100);

      const posDeg = (pos / total) * 360;
      const neuDeg = (neu / total) * 360;

      chartElements.donut.style.background = `conic-gradient(
        var(--ie-success) 0deg ${posDeg}deg,
        var(--ie-text-light) ${posDeg}deg ${posDeg + neuDeg}deg,
        var(--ie-danger) ${posDeg + neuDeg}deg 360deg
      )`;

      const posLabel = document.getElementById("legend-pos-label");
      const neuLabel = document.getElementById("legend-neu-label");
      const negLabel = document.getElementById("legend-neg-label");
      
      if(posLabel) posLabel.textContent = `Positive (${posPct}%)`;
      if(neuLabel) neuLabel.textContent = `Neutral (${neuPct}%)`;
      if(negLabel) negLabel.textContent = `Negative (${negPct}%)`;
    }

    // 3. Update Bar Charts (Topic Presence)
    chartElements.bars.forEach(bar => {
      const label = bar.querySelector(".ie-bar-label").textContent.trim();
      let percentage = 0;
      
      for (const [topicKey, val] of Object.entries(stats.topic_counts)) {
        if (topicKey.includes(label) || label.includes(topicKey)) {
          percentage = val; 
          break;
        }
      }
      
      const fill = bar.querySelector(".ie-bar-fill");
      const value = bar.querySelector(".ie-bar-value");
      
      if (fill) fill.style.width = `${percentage}%`;
      if (value) value.textContent = `${percentage}%`;
    });

    // 4. Update Stacked Sentiment Matrix
    if (stats.topic_sentiment_matrix) {
      updateStackedBars(stats.topic_sentiment_matrix);
    }

    // 5. Update Executive Summaries (Dual Column Layout)
    if (stats.executive_summaries) {
        const summaryMap = {
            "Work-Life Balance & Comp": "summary-0",
            "Career Growth & Culture": "summary-1",
            "Team & Office Environment": "summary-2",
            "Business Strategy & Ops": "summary-3",
            "Management & Daily Ops": "summary-4"
        };

        for (const [topicName, summaryData] of Object.entries(stats.executive_summaries)) {
            const containerId = summaryMap[topicName];
            if (containerId) {
                const container = document.getElementById(containerId);
                if (container) {
                    // Check if we received the new split format or old format
                    const prosText = summaryData.pros || summaryData; 
                    const consText = summaryData.cons || "No data available.";

                    // Injecting the Split Grid Layout
                    container.innerHTML = `
                      <div class="ie-pros-cons">
                        <div class="ie-pros-section">
                            <div class="ie-pros-title">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                What's Working
                            </div>
                            <p style="font-size: 0.85rem; line-height: 1.5;">${prosText}</p>
                        </div>
                        
                        <div class="ie-cons-section">
                            <div class="ie-cons-title">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                                Needs Attention
                            </div>
                            <p style="font-size: 0.85rem; line-height: 1.5;">${consText}</p>
                        </div>
                      </div>`;
                }
            }
        }
    } 

    // 6. Update Word Cloud
    const wcImg = document.getElementById("wordcloud-img");
    const wcPlaceholder = document.getElementById("wc-placeholder");
    const wcTopicLabel = document.getElementById("wc-topic-name");

    if (stats.top_topic) {
        if(wcTopicLabel) wcTopicLabel.textContent = stats.top_topic;
    }

    if (stats.wordcloud_image && wcImg) {
        wcImg.src = stats.wordcloud_image;
        wcImg.style.display = "block";
        if(wcPlaceholder) wcPlaceholder.style.display = "none";
    } else {
        if(wcImg) wcImg.style.display = "none";
        if(wcPlaceholder) {
            wcPlaceholder.textContent = "Not enough text data to generate word cloud.";
            wcPlaceholder.style.display = "block";
        }
    }
  }

  // ==================== THEME & STATE ====================
  function initTheme() {
    const savedTheme = localStorage.getItem("ie-theme")
    if (savedTheme) {
      theme = savedTheme
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      theme = "dark"
    }
    applyTheme()
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme)
    localStorage.setItem("ie-theme", theme)
  }

  function toggleTheme() {
    appContainer.style.opacity = "0.92"
    setTimeout(() => {
      theme = theme === "light" ? "dark" : "light"
      applyTheme()
      setTimeout(() => { appContainer.style.opacity = "1" }, 100)
    }, 150)
  }

  function showState(state) {
    uploadState.style.display = state === "upload" ? "flex" : "none"
    loadingState.style.display = state === "loading" ? "flex" : "none"
    dashboardState.style.display = state === "dashboard" ? "block" : "none"
    
    // FIX: Show download button only on dashboard
    if (downloadBtn) {
        downloadBtn.style.display = state === "dashboard" ? "flex" : "none";
    }

    currentState = state
    if (state === "dashboard") animateCharts();
  }

  function transitionToState(newState) {
    const mainContent = document.getElementById("main-content")
    mainContent.style.opacity = "0"
    setTimeout(() => {
      showState(newState)
      mainContent.style.opacity = "1"
    }, 150)
  }

  // ==================== FILE HANDLING ====================
  function handleDragOver(e) { e.preventDefault(); dropzone.classList.add("dragover"); }
  function handleDragLeave(e) { e.preventDefault(); dropzone.classList.remove("dragover"); }
  function handleDrop(e) {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) handleFileSelection(e.dataTransfer.files[0]);
  }

  function handleFileSelection(file) {
    const validExtensions = [".pdf", ".csv", ".json"]
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase()

    if (validExtensions.includes(fileExtension)) {
      selectedFileName = file.name
      fileNameSpan.textContent = file.name
      fileSelected.style.display = "flex"
      analyzeBtn.disabled = false
    } else {
      alert("Invalid format. Use .pdf, .csv, or .json")
    }
  }

  // ==================== API HANDLER ====================
  async function handleAnalyze() {
    const file = fileInput.files[0] || fileInput.dataTransfer?.files[0];
    if (!file) return;

    const fileExtension = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();
    const reader = new FileReader();

    // Define what happens when file is read
    reader.onload = async (e) => {
      transitionToState("loading");
      
      let payload = {
          type: fileExtension,
          content: null
      };

      // For PDF, we send the Base64 string (split off the 'data:application/pdf;base64,' part)
      if (fileExtension === 'pdf') {
          payload.content = e.target.result.split(',')[1]; 
      } else {
          // For CSV/JSON, we send raw text
          payload.content = e.target.result;
      }

      try {
        const response = await fetch('http://127.0.0.1:5000/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        
        if (result.error) throw new Error(result.error);
        
        reviewsData = result.new_entries || [];
        updateDashboard(result.dashboard_stats);
        
        setTimeout(() => {
          transitionToState("dashboard");
          renderTable();
        }, 1200);

      } catch (err) {
        alert("Analysis Failed: " + err.message);
        showState("upload");
      }
    };

    // --- CRITICAL CHANGE: Read based on file type ---
    if (fileExtension === 'pdf') {
        reader.readAsDataURL(file); // Read binary for PDF
    } else {
        reader.readAsText(file);    // Read text for CSV/JSON
    }
  }
   

  // ==================== TABLE & ACCORDION ====================
  function initAccordion() {
    document.querySelectorAll(".ie-accordion-header").forEach(header => {
      header.addEventListener("click", function () {
        const content = document.getElementById(this.getAttribute("data-target"))
        const chevron = this.querySelector(".ie-accordion-chevron")
        content.classList.toggle("open")
        chevron.classList.toggle("open")
      })
    })
  }

  function renderTable() {
    const totalPages = Math.ceil(reviewsData.length / ITEMS_PER_PAGE)
    const currentData = reviewsData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

    tableBody.innerHTML = ""
    currentData.forEach(rev => {
      const row = `<tr>
        <td>${rev.snippet}</td>
        <td>${rev.topic}</td>
        <td><span class="ie-badge ${rev.sentiment.toLowerCase()}"><span class="ie-badge-dot"></span>${rev.sentiment}</span></td>
      </tr>`;
      tableBody.innerHTML += row;
    });

    paginationInfo.textContent = `Showing ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, reviewsData.length)} of ${reviewsData.length}`
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  // ==================== CORE CHART LOGIC ====================
  function updateStackedBars(matrix) {
    const matrixMap = {
      "Work-Life Balance & Comp": "topic-0-stacked",
      "Career Growth & Culture": "topic-1-stacked",
      "Team & Office Environment": "topic-2-stacked",
      "Business Strategy & Ops": "topic-3-stacked",
      "Management & Daily Ops": "topic-4-stacked"
    };

    for (const [topicName, sentiments] of Object.entries(matrix)) {
      const container = document.getElementById(matrixMap[topicName]);
      if (!container) continue;

      const total = sentiments.Positive + sentiments.Neutral + sentiments.Negative || 1;
      const pos = (sentiments.Positive / total) * 100;
      const neu = (sentiments.Neutral / total) * 100;
      const neg = (sentiments.Negative / total) * 100;

      container.innerHTML = `
        <div class="ie-stacked-segment positive" style="width: ${pos}%" title="Positive: ${sentiments.Positive}"></div>
        <div class="ie-stacked-segment neutral" style="width: ${neu}%" title="Neutral: ${sentiments.Neutral}"></div>
        <div class="ie-stacked-segment negative" style="width: ${neg}%" title="Negative: ${sentiments.Negative}"></div>
      `;
    }
  }

  // ==================== INIT ====================
  function init() {
    initTheme();
    initAccordion();
    themeToggle.addEventListener("click", toggleTheme);
    dropzone.addEventListener("dragover", handleDragOver);
    dropzone.addEventListener("dragleave", handleDragLeave);
    dropzone.addEventListener("drop", handleDrop);
    dropzone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => handleFileSelection(e.target.files[0]));
    analyzeBtn.addEventListener("click", handleAnalyze);
    prevBtn.addEventListener("click", () => { currentPage--; renderTable(); });
    nextBtn.addEventListener("click", () => { currentPage++; renderTable(); });
    
   // --- FASTER & MORE RELIABLE PDF METHOD (Native Print) ---
    if (downloadBtn) {
        downloadBtn.addEventListener("click", () => {
            // This triggers the browser's built-in "Save as PDF" dialog instantly
            window.print();
        });
    }

    showState("upload");
  }

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", init) : init();

})();