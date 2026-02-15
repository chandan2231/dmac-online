// ================================
// DMAC Game Report HTML Template
// ================================

const dmacGameReportHTMLTemplate = (data) => {
    const {
        patientName = '',
        reportDate = new Date().toLocaleDateString(),
        categories = []
    } = data

    // Helper to get score string
    const getScore = (catName) => {
        // Mapping internal names to ensure we pick the right one
        // categoryDisplayNames map is implicit in how we call this function
        const cat = categories.find(c => c.name === catName);
        return cat ? cat.percentage.toFixed(2) + '%' : '0.00%';
    };

    // --- Graph Generation Logic ---
    const generateGraph = () => {
        // Use categories directly from data
        // Filter out any potential empty categories if needed, but we expect 11.
        const graphData = categories.map(cat => ({
            name: cat.name,
            value: cat.percentage
        }));

        const width = 700;
        const height = 400;
        const margin = { top: 20, right: 20, bottom: 150, left: 50 }; // Increased bottom margin for rotated labels
        const contentWidth = width - margin.left - margin.right;
        const contentHeight = height - margin.top - margin.bottom;

        const barWidth = 30;
        const gap = (contentWidth - (graphData.length * barWidth)) / (graphData.length + 1);

        // Y-Axis Grid Lines (10% increments)
        let gridLines = '';
        let yLabels = '';
        for (let i = 0; i <= 10; i++) {
            const p = i * 10;
            const y = contentHeight - (contentHeight * (p / 100));
            gridLines += `<line x1="0" y1="${y}" x2="${contentWidth}" y2="${y}" stroke="#e0e0e0" stroke-width="1" />`;
            yLabels += `<text x="-10" y="${y + 4}" text-anchor="end" font-size="10" fill="#666">${p}%</text>`;
        }

        // Bars and X-Labels
        let bars = '';
        graphData.forEach((d, i) => {
            const x = margin.left + gap + (i * (barWidth + gap));
            const barHeight = contentHeight * (d.value / 100);
            const y = margin.top + contentHeight - barHeight;

            let color = '#6f4e37'; // brown < 20
            if (d.value >= 80) color = '#2ecc71';
            else if (d.value >= 60) color = '#3498db';
            else if (d.value >= 40) color = '#f1c40f';
            else if (d.value >= 20) color = '#e74c3c';

            // Truncate name if too long for display? Rotated handled below.
            bars += `
            <rect x="${x - margin.left}" y="${y - margin.top}" width="${barWidth}" height="${barHeight}" fill="${color}" />
            <text x="${x - margin.left + barWidth / 2}" y="${y - margin.top - 5}" text-anchor="middle" font-size="10" font-weight="bold" fill="#333">${Math.round(d.value)}%</text>
            
            <g transform="translate(${x - margin.left + barWidth / 2}, ${contentHeight + 15})">
                <text transform="rotate(45)" text-anchor="start" font-size="9" fill="#333">${d.name}</text>
            </g>
          `;
        });

        return `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(${margin.left}, ${margin.top})">
                ${gridLines}
                ${yLabels}
                <line x1="0" y1="0" x2="0" y2="${contentHeight}" stroke="#333" stroke-width="1" />
                <line x1="0" y1="${contentHeight}" x2="${contentWidth}" y2="${contentHeight}" stroke="#333" stroke-width="1" />
                ${bars}
                <text x="${-contentHeight / 2}" y="-35" transform="rotate(-90)" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">Percentage (%)</text>
            </g>
        </svg>
      `;
    }

    const generateTBIGraph = () => {
        // Placeholder for TBI if needed, or update to use relevant subsets
        // For now, keeping logic but updating keys if they exist in new definition
        // Existing keys: 'Semantic / Language', 'Immediate Auditory Recall', 'Immediate Visual Recall', 'Delayed Recall'
        // New keys: 'Language & Naming', 'Immediate Auditory Memory', 'Visual Memory', 'Delayed Recall Memory'
        const targetOrder = [
            { key: 'Language & Naming', label: 'Language' },
            { key: 'Immediate Auditory Memory', label: 'Auditory' },
            { key: 'Visual Memory', label: 'Visual' },
            { key: 'Delayed Recall Memory', label: 'Delayed Recall' }
        ];

        const graphData = targetOrder.map(item => {
            const cat = categories.find(c => c.name === item.key);
            return {
                name: item.label,
                value: cat ? cat.percentage : 0
            };
        });

        const width = 600;
        const height = 300;
        const margin = { top: 30, right: 20, bottom: 50, left: 50 };
        const contentWidth = width - margin.left - margin.right;
        const contentHeight = height - margin.top - margin.bottom;

        const barWidth = 60;
        const gap = (contentWidth - (graphData.length * barWidth)) / (graphData.length + 1);

        let gridLines = '';
        let yLabels = '';
        for (let i = 0; i <= 10; i += 2) {
            const p = i * 10;
            const y = contentHeight - (contentHeight * (p / 100));
            gridLines += `<line x1="0" y1="${y}" x2="${contentWidth}" y2="${y}" stroke="#e0e0e0" stroke-width="1" />`;
            yLabels += `<text x="-10" y="${y + 4}" text-anchor="end" font-size="10" fill="#666">${p}%</text>`;
        }

        let bars = '';
        graphData.forEach((d, i) => {
            const x = margin.left + gap + (i * (barWidth + gap));
            const barHeight = contentHeight * (d.value / 100);
            const y = margin.top + contentHeight - barHeight;

            let color = '#6f4e37';
            if (d.value >= 80) color = '#2ecc71';
            else if (d.value >= 60) color = '#3498db';
            else if (d.value >= 40) color = '#f1c40f';
            else if (d.value >= 20) color = '#e74c3c';

            bars += `
            <rect x="${x - margin.left}" y="${y - margin.top}" width="${barWidth}" height="${barHeight}" fill="${color}" />
            <text x="${x - margin.left + barWidth / 2}" y="${y - margin.top - 5}" text-anchor="middle" font-size="12" font-weight="bold" fill="#333">${Math.round(d.value)}%</text>
            <text x="${x - margin.left + barWidth / 2}" y="${contentHeight + 20}" text-anchor="middle" font-size="12" fill="#333">${d.name}</text>
          `;
        });

        return `
        <div class="graph-container" style="height: 350px;"> 
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(${margin.left}, ${margin.top})">
                    ${gridLines}
                    ${yLabels}
                    <line x1="0" y1="0" x2="0" y2="${contentHeight}" stroke="#333" stroke-width="1" />
                    <line x1="0" y1="${contentHeight}" x2="${contentWidth}" y2="${contentHeight}" stroke="#333" stroke-width="1" />
                    ${bars}
                </g>
            </svg>
        </div>
    `;
    }

    // --- Bell Curve / UCPAS Logic ---
    const erf = (x) => {
        const sign = x >= 0 ? 1 : -1;
        x = Math.abs(x);
        const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429;
        const p = 0.3275911;
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return sign * y;
    }


    const generateBellCurve = () => {
        const getCatVal = (name) => {
            const c = categories.find(cat => cat.name === name);
            return c ? c.percentage : 0;
        };

        const d = getCatVal('Delayed Recall Memory');
        const a = getCatVal('Attention & Concentration');
        const w = getCatVal('Working Memory');
        const e = getCatVal('Executive Function');

        const mu = 50;
        const sd = 15;
        const ucpas = (d + a + w + e) / 4.0;
        const z = (ucpas - mu) / sd;
        const phi = (zVal) => 0.5 * (1 + erf(zVal / Math.SQRT2));
        const percentile = Math.max(0, Math.min(100, phi(z) * 100));

        let band = "Average range";
        if (percentile < 10) band = "Very low";
        else if (percentile < 25) band = "Below average";
        else if (percentile < 75) band = "Average range";
        else if (percentile < 90) band = "Above average";
        else band = "High";

        const width = 700;
        const height = 300;
        const margin = { top: 20, right: 30, bottom: 50, left: 30 };
        const graphW = width - margin.left - margin.right;
        const graphH = height - margin.top - margin.bottom;
        const minZ = -3.5;
        const maxZ = 3.5;

        const mapX = (zVal) => margin.left + ((zVal - minZ) / (maxZ - minZ)) * graphW;
        const maxDensity = 0.3989;
        const mapY = (density) => (margin.top + graphH) - ((density / maxDensity) * graphH);

        let pathD = `M ${mapX(minZ)} ${mapY(0)}`;
        for (let i = minZ; i <= maxZ; i += 0.1) {
            const density = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * i * i);
            pathD += ` L ${mapX(i)} ${mapY(density)}`;
        }
        pathD += ` L ${mapX(maxZ)} ${mapY(0)} Z`;

        const plotZ = Math.max(minZ, Math.min(maxZ, z));
        const userX = mapX(plotZ);
        const userDensity = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * plotZ * plotZ);
        const userY = mapY(userDensity);

        return `
      <div style="margin-top: 40px; text-align: center;">
        <h3 style="margin-bottom: 20px; color: #2c3e50;">UCPAS & Percentile Ranking</h3>
        <div style="background: #f9f9f9; border: 1px solid #ddd; padding: 15px; border-radius: 8px; display: inline-block; margin-bottom: 20px;">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">UCPAS Score: <span style="color: #2980b9;">${ucpas.toFixed(2)}</span></div>
            <div style="font-size: 14px; margin-bottom: 5px;">Percentile: <b>${percentile.toFixed(1)}th</b></div>
            <div style="font-size: 14px; color: #555;">Interpretation: <b>${band}</b></div>
        </div>
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #eee; background: white;">
            <defs>
                <linearGradient id="bellGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:#3498db;stop-opacity:0.6" />
                    <stop offset="100%" style="stop-color:#3498db;stop-opacity:0.2" />
                </linearGradient>
            </defs>
            <path d="${pathD}" fill="url(#bellGradient)" stroke="#2980b9" stroke-width="2" />
            <line x1="${userX}" y1="${userY}" x2="${userX}" y2="${margin.top + graphH}" stroke="#e74c3c" stroke-width="3" stroke-dasharray="0" />
            <circle cx="${userX}" cy="${userY}" r="6" fill="#e74c3c" />
            <text x="${userX}" y="${userY - 10}" text-anchor="middle" font-weight="bold" fill="#e74c3c" font-size="12">You</text>
            
            <text x="${mapX(-2)}" y="${height - 20}" text-anchor="middle" font-size="11" fill="#7f8c8d">-2σ</text>
            <text x="${mapX(-1)}" y="${height - 20}" text-anchor="middle" font-size="11" fill="#7f8c8d">-1σ</text>
            <text x="${mapX(0)}" y="${height - 20}" text-anchor="middle" font-size="11" fill="#7f8c8d">Mean</text>
            <text x="${mapX(1)}" y="${height - 20}" text-anchor="middle" font-size="11" fill="#7f8c8d">+1σ</text>
            <text x="${mapX(2)}" y="${height - 20}" text-anchor="middle" font-size="11" fill="#7f8c8d">+2σ</text>

            <text x="${width / 2}" y="${height - 5}" text-anchor="middle" font-size="12" font-style="italic" fill="#95a5a6">Population Distribution (Bell Curve)</text>
        </svg>
      </div>
    `;
    };

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SDMAC-AI 5.0 Comprehensive Cognitive Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2c5aa0;
            padding-bottom: 20px;
        }

        .header h1 {
            color: #2c5aa0;
            font-size: 24px;
            margin-bottom: 15px;
            font-weight: bold;
        }

        .header .test-info {
            margin-top: 15px;
        }

        .header .test-info p {
            margin: 5px 0;
            font-size: 14px;
        }

        .section {
            margin-bottom: 30px;
        }

        .section-title {
            background-color: #2c5aa0;
            color: white;
            padding: 12px 15px;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
        }

        .section-title.gray {
            background-color: transparent;
            color: #999;
            padding: 12px 0;
            border-bottom: none;
        }

        .section-subtitle {
            color: #2c5aa0;
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            margin-top: 20px;
        }

        .content {
            padding: 0 15px;
            text-align: justify;
        }

        .content p {
            margin-bottom: 12px;
        }

        .content ul {
            margin-left: 20px;
            margin-bottom: 12px;
        }

        .content li {
            margin-bottom: 8px;
        }

        .score-categories {
            background-color: white;
            padding: 20px 15px;
            border-left: 5px solid #2c5aa0;
            margin: 15px 0;
        }

        .score-categories ul {
            list-style: none;
            margin-left: 0;
        }

        .score-categories li {
            padding: 12px 0;
            border-bottom: 1px solid #e0e0e0;
            font-size: 15px;
            color: #333;
        }

        .score-categories li:last-child {
            border-bottom: none;
        }

        .color-indicator {
            display: inline-block;
            width: 22px;
            height: 22px;
            margin-right: 15px;
            vertical-align: middle;
            border: 2px solid #ccc;
            border-radius: 3px;
        }

        .green { background-color: #4CAF50; border-color: #4CAF50; }
        .blue { background-color: #2196F3; border-color: #2196F3; }
        .yellow { background-color: #FFC107; border-color: #FFC107; }
        .red { background-color: #F44336; border-color: #F44336; }
        .dark-brown { background-color: #5D4037; border-color: #5D4037; }

        .mapping-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }

        .mapping-table th {
            background-color: #2c5aa0;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }

        .mapping-table td {
            padding: 10px 12px;
            border: 1px solid #ddd;
        }

        .mapping-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .mapping-table tr:hover {
            background-color: #f0f0f0;
        }

        .score-cell {
            font-weight: bold;
            text-align: center;
            font-size: 16px;
        }

        .graph-placeholder {
            background-color: #f0f0f0;
            border: 2px dashed #2c5aa0;
            padding: 40px;
            text-align: center;
            margin: 20px 0;
            color: #666;
            font-style: italic;
        }
        
        /* Helper to ensure graph fits */
        .graph-container svg {
             max-width: 100%;
             height: auto;
        }

        .highlight-box {
            background-color: #e3f2fd;
            border-left: 4px solid #2c5aa0;
            padding: 15px;
            margin: 15px 0;
        }

        .disclaimer {
            background-color: #fff9e6;
            border: 2px solid #ffc107;
            padding: 20px;
            margin-top: 30px;
            border-radius: 5px;
        }

        .disclaimer h3 {
            color: #f57c00;
            margin-bottom: 10px;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #2c5aa0;
            color: #666;
        }

        .bold-text {
            font-weight: bold;
        }

        .emoji {
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <h1>SDMAC-AI 5.0 Comprehensive Cognitive Test Report</h1>
            <div class="test-info">
                <p><strong>Name:</strong> ${patientName}</p>
                <p><strong>Date of the test:</strong> ${reportDate}</p>
            </div>
        </div>

        <!-- Introduction Section -->
        <div class="section">
            <div class="section-title">Self-Administered Cognitive Assessment Test Battery (SDMAC)</div>
            <div class="content">
                <p><strong>Human cognition is the ability to understand, learn, remember, and interact with the surroundings.</strong></p>
                
                <p>This process happens continuously through visual and auditory input, allowing the brain to interpret information, make decisions, and respond appropriately.</p>
                
                <p>The Self-Administered Memory & Attention Cognitive Test is performed under standardized testing conditions using clear and simple instructions. It is conducted through Self-Digital Memory & Attention Cognitive Assessment (SDMAC), an online digital cognitive testing tool.</p>
                
                <p><strong>SDMAC has been extensively researched in both:</strong> Healthy individuals and Individuals with cognitive impairment, including memory loss and dementia</p>
                
                <p><strong>SDMAC evaluates 10 different cognitive domain functions using:</strong> Audio-visual interactive test batteries, Timed in sequential cognitive tasks on Digital screen–based responses</p>
                
                <p>These domains assess how well different brain circuits function during thinking, memory, attention, and problem-solving activities.</p>
                
                <div class="highlight-box">
                    <p><strong>Test Performance & Accuracy</strong> depends on sincere effort and active participation. The Users must carefully follow instructions with tasks that are time-limited and designed to measure real-time cognitive processing. Greater engagement leads to more reliable results. Our DMAC research and data analysed by third parties has reported <strong>"sensitivity of 86.5%, specificity of 89.3%, and an overall correct classification rate of 87.2% of the SDMAC".</strong></p>
                </div>
                
                <p>Each cognitive domain is scored individually and displayed as a percentage, reflecting the strength of that specific brain circuit. The four major cognitive domain functions are further analyzed and compared to the individual with cognitive impaired and normal cognitive functioning in the community to determine the percentile score on bell curve.</p>
                
                <p>Moderate to severe impairment scores indicate a significant reduction in the brain's ability to: Process information, Maintain attention, Store or retrieve memory, Perform complex cognitive tasks. These findings suggest difficulty across multiple cognitive domains.</p>
            </div>
        </div>

        <!-- Score Categories Section -->
        <div class="section">
            <div class="section-subtitle">Cognitive Score Categories and Interpretation:</div>
            <div class="score-categories">
                <ul>
                    <li><span class="color-indicator green"></span><strong>≥ 80%</strong> → Normal cognitive function</li>
                    <li><span class="color-indicator blue"></span><strong>60% – 79%</strong> → Mild cognitive impairment</li>
                    <li><span class="color-indicator yellow"></span><strong>40% – 59%</strong> → Moderate cognitive impairment</li>
                    <li><span class="color-indicator red"></span><strong>20% – 39%</strong> → Moderately severe cognitive impairment</li>
                    <li><span class="color-indicator dark-brown"></span><strong>&lt; 20%</strong> → Severe cognitive impairment</li>
                </ul>
            </div>
        </div>

        <!-- DMAC-NAS Framework Section -->
        <div class="section">
            <div class="section-title gray">Neuroanatomical Signature of DMAC Scores with Mapping (DMAC-NAS Framework)</div>
            <div class="content">
                <p>The DMAC Neuroanatomical Signature (DMAC-NAS) translates multidomain cognitive test performance into brain-region–specific functional vulnerability patterns.</p>
                
                <p>Each DMAC battery maps to dominant neural networks; the pattern of deficits across the 10 batteries creates a "signature", not just a score.</p>
                
                <div class="section-subtitle">DMAC Cognitive Test Batteries → Dominant Brain Network Mapping Score</div>
                
                <table class="mapping-table">
                    <thead>
                        <tr>
                            <th>Functional Domain</th>
                            <th>Core Cognitive Function</th>
                            <th>Primary Neuroanatomical Network</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${categories.map((cat, index) => {
        const networks = [
            'Frontal–Parietal Network, Brainstem arousal',
            'Frontal–Cerebellar–Brainstem',
            'Dorsolateral Prefrontal Cortex',
            'Frontal–Temporal Network',
            'Medial Temporal (Hippocampus) network',
            'Occipital–Temporal Network',
            'Temporal–Parietal Language Network',
            'Parietal–Occipital Network',
            'Cerebellar–Parietal–Frontal',
            'Orbitofrontal–Limbic Network',
            'Temporal–frontal–limbic network'
        ];
        // Use index to pick network, fallback if categories > 11
        const network = networks[index] || 'General Neural Network';

        return `
                            <tr>
                                <td>Cog. Test-${index + 1}</td>
                                <td>${cat.name}</td>
                                <td>${network}</td>
                                <td class="score-cell">${cat.percentage.toFixed(2)}%</td>
                            </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Graph Placeholders -->
        <div class="section">
            <div class="section-subtitle"><span class="emoji">📌</span> Cognitive Domain Profile</div>
            <div class="graph-container">
                 ${generateGraph()}
            </div>
        </div>

        <div class="section">
            <div class="section-subtitle">Traumatic Brain Injury Pattern Graph</div>
            ${generateTBIGraph()}
        </div>

        <div class="section">
            <div class="section-subtitle">Your Percentile Cognitive functional Score in comparison</div>
            <div class="graph-container">
                 ${generateBellCurve()}
            </div>
        </div>

        <!-- LICCA and Training Section -->
        <div class="section">
            <div class="section-title">Personalized Training & Brain Exercise</div>
            <div class="content">
                <p>The Self-DMAC cognitive test scores and questionnaire results are collectively processed through an AI-driven algorithm to generate personalized training plans within the Life Integrated Computerized Cognitive Application (LICCA). LICCA delivers targeted cognitive exercises designed to strengthen brain circuits and cognitive functions through repeated practice and adaptive engagement.</p>
                
                <div class="highlight-box">
                    <p>The SDMAC cognitive test scores are intended for cognitive screening and wellness monitoring only and are not confirmatory neuropsychological diagnostic tests. Individuals are advised to consult their physician or neurologist for formal neuropsychological evaluation and for any medical diagnosis, intervention, or treatment decisions.</p>
                </div>
                
                <p><strong>RM360 Brain training exercise</strong> by repeated practice strengthens brain circuits, improves communication between areas so the brain works more efficiently and supports better daily functioning. Think of it as rewiring and strengthening cognitive pathways.</p>
            </div>
        </div>

        <!-- Disclaimer Section -->
        <div class="disclaimer">
            <h3>Disclaimer</h3>
            <p>SDMAC has been researched and developed to assess cognitive domain strengths and weaknesses. It is not intended for medical diagnosis and does not replace professional medical evaluation or treatment. This program is designed to support understanding of cognitive function and cognitive impairment and to help guide discussions with qualified healthcare providers. Individual results may vary.</p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>Contact@regainmemory.com</strong></p>
        </div>
    </div>
</body>
</html>
  `
}

const htmlTemplates = {
    dmacGameReportHTMLTemplate
}

export default htmlTemplates