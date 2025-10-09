// =========================
//  Lista de Chequeo - TEC
//  script.js (versión PDF + Contador global)
// =========================

// Variables globales
let visitCount = 0;
let checklistData = {};

// -----------------------
// Inicialización al cargar la página
// -----------------------
document.addEventListener('DOMContentLoaded', function () {
  initializeVisitCounter();   // contador global (CountAPI)
  initializeChecklist();
  initializeModal();
  initializeActionButtons();
});

// -----------------------
// Contador de visitas global (CountAPI) con create + fallback
// -----------------------
async function initializeVisitCounter() {
  const el = document.getElementById('visitCount');
  if (!el) return;

  // Usa un namespace y key estables y ASCII (evita tildes reales)
  const NAMESPACE = 'evarelena.github.io';
  const KEY = 'Informes-de-Laboratorio-F-sica-General-TEC'; // coincide con tu slug público

  const base = 'https://api.countapi.xyz';
  const urlCreate = `${base}/create?namespace=${encodeURIComponent(NAMESPACE)}&key=${encodeURIComponent(KEY)}&value=0`;
  const urlHit    = `${base}/hit/${encodeURIComponent(NAMESPACE)}/${encodeURIComponent(KEY)}`;
  const urlGet    = `${base}/get/${encodeURIComponent(NAMESPACE)}/${encodeURIComponent(KEY)}`;

  // Helper con logs
  async function safeFetch(url, desc) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      console.log('[CountAPI]', desc, r.status, url);
      if (!r.ok) throw new Error(`${desc} status ${r.status}`);
      const data = await r.json();
      console.log('[CountAPI] data', data);
      return data;
    } catch (e) {
      console.error('[CountAPI] error in', desc, e);
      throw e;
    }
  }

  try {
    // 1) Crea si no existe (idempotente)
    await safeFetch(urlCreate, 'create');

    // 2) Incrementa y muestra
    const hit = await safeFetch(urlHit, 'hit');
    const total = (hit.value ?? hit.count ?? 0);
    visitCount = total;                 // <-- actualiza variable global
    el.textContent = String(total);
  } catch {
    // 3) Si falló el hit, al menos intenta leer
    try {
      const get = await safeFetch(urlGet, 'get');
      const total2 = (get.value ?? get.count ?? 0);
      visitCount = total2;              // <-- actualiza variable global
      el.textContent = String(total2);
    } catch {
      // 4) Fallback: contador local por si CountAPI no responde
      const stored = localStorage.getItem('visitCount');
      let local = stored ? parseInt(stored, 10) : 0;
      local++;
      localStorage.setItem('visitCount', String(local));
      visitCount = local;               // <-- actualiza variable global
      el.textContent = String(local);
    }
  }
}

// -----------------------
// Inicializar checklist
// -----------------------
function initializeChecklist() {
  loadChecklistData();

  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', function () {
      updateSectionProgress(this);
      updateOverallProgress();
      saveChecklistData();
    });
  });

  // Actualizar progresos al cargar
  const sections = document.querySelectorAll('.checklist-section');
  sections.forEach((section) => {
    const cbs = section.querySelectorAll('input[type="checkbox"]');
    if (cbs.length > 0) updateSectionProgress(cbs[0]);
  });
  updateOverallProgress();
}

// ---------------------------------
// Actualizar progreso de sección
// ---------------------------------
function updateSectionProgress(checkbox) {
  const section = checkbox.closest('.checklist-section');
  if (!section) return;

  const sectionName = section.dataset.section;
  const checkboxes = section.querySelectorAll('input[type="checkbox"]');
  const checkedBoxes = section.querySelectorAll('input[type="checkbox"]:checked');

  const total = checkboxes.length || 1; // evita división por 0
  const completed = checkedBoxes.length;
  const percentage = (completed / total) * 100;

  const progressText = section.querySelector('.progress-text');
  if (progressText) progressText.textContent = `${completed}/${total}`;

  const progressFill = section.querySelector('.progress-fill');
  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
    if (percentage === 100) {
      progressFill.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
      showSectionCongratulations(sectionName);
    } else if (percentage >= 50) {
      progressFill.style.background = 'linear-gradient(135deg, #ed8936, #dd6b20)';
    } else {
      progressFill.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    }
  }
}

// ----------------------------
// Actualizar progreso general
// ----------------------------
function updateOverallProgress() {
  const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  const allCheckedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');

  const totalItems = allCheckboxes.length || 1;
  const completedItems = allCheckedBoxes.length;
  const percentage = (completedItems / totalItems) * 100;

  const totalCompletedEl = document.getElementById('totalCompleted');
  const totalItemsEl = document.getElementById('totalItems');
  const completionPercentageEl = document.getElementById('completionPercentage');

  if (totalCompletedEl) totalCompletedEl.textContent = completedItems;
  if (totalItemsEl) totalItemsEl.textContent = totalItems;
  if (completionPercentageEl) completionPercentageEl.textContent = `${Math.round(percentage)}%`;

  const overallProgressFill = document.getElementById('overallProgressFill');
  if (overallProgressFill) {
    overallProgressFill.style.width = `${percentage}%`;
    if (percentage === 100) {
      overallProgressFill.style.background = 'rgba(72, 187, 120, 0.8)';
      showFinalCongratulations();
    } else if (percentage >= 50) {
      overallProgressFill.style.background = 'rgba(237, 137, 54, 0.8)';
    } else {
      overallProgressFill.style.background = 'rgba(102, 126, 234, 0.8)';
    }
  }
}

// ------------------------------
// Guardar/Cargar checklist
// ------------------------------
function saveChecklistData() {
  const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
  const data = {};
  allCheckboxes.forEach((checkbox) => {
    data[checkbox.dataset.item] = checkbox.checked;
  });
  localStorage.setItem('checklistData', JSON.stringify(data));
}

function loadChecklistData() {
  const storedData = localStorage.getItem('checklistData');
  if (!storedData) return;

  const data = JSON.parse(storedData);
  Object.keys(data).forEach((itemId) => {
    const checkbox = document.querySelector(`input[data-item="${itemId}"]`);
    if (checkbox) checkbox.checked = data[itemId];
  });
}

// ------------------------------
// Modal de Guía (PDF)
// ------------------------------
function initializeModal() {
  const modal = document.getElementById('guideModal');
  const btn = document.getElementById('guideButton');
  const span = document.getElementsByClassName('close')[0];

  if (!modal || !btn || !span) return;

  btn.onclick = () => (modal.style.display = 'block');
  span.onclick = () => (modal.style.display = 'none');
  window.onclick = (event) => {
    if (event.target === modal) modal.style.display = 'none';
  };
}

// -----------------------------------------
// Botones de acción (limpiar y exportar)
// -----------------------------------------
function initializeActionButtons() {
  const clearBtn = document.getElementById('clearAll');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      if (confirm('¿Está seguro de limpiar todo el progreso? Esta acción no se puede deshacer.')) {
        const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        allCheckboxes.forEach((checkbox) => (checkbox.checked = false));

        const sections = document.querySelectorAll('.checklist-section');
        sections.forEach((section) => {
          const cbs = section.querySelectorAll('input[type="checkbox"]');
          if (cbs.length > 0) updateSectionProgress(cbs[0]);
        });

        updateOverallProgress();
        saveChecklistData();
        showNotification('Progreso limpiado exitosamente', 'success');
      }
    });
  }

  const exportBtn = document.getElementById('exportProgress');
  if (exportBtn) {
    // Asegurar que no haya handlers previos
    exportBtn.replaceWith(exportBtn.cloneNode(true));
    const freshBtn = document.getElementById('exportProgress');
    freshBtn.addEventListener('click', exportProgressToPDF);
  }
}

// ----------------------------------
// Exportar Progreso a PDF (jsPDF)
// ----------------------------------
function exportProgressToPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('No se cargó jsPDF. Verifique la etiqueta <script> del CDN en index.html.');
    return;
  }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' }); // Carta (8.5x11)

  // --- Recolección de datos desde el DOM ---
  const sections = Array.from(document.querySelectorAll('.checklist-section'));
  const totalItems = sections.reduce((acc, sec) => {
    return acc + sec.querySelectorAll('.checklist-item input[type="checkbox"]').length;
  }, 0);
  const totalCompleted = sections.reduce((acc, sec) => {
    return acc + sec.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
  }, 0);
  const percentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  // Fecha/hora local CR
  const now = new Date();
  const fecha = now.toLocaleString('es-CR', { hour12: false });

  // --- Encabezado ---
  let y = 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Lista de Chequeo - Informes de Laboratorio (TEC)', 40, y);
  y += 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Fecha: ${fecha}`, 40, y); y += 14;
  doc.text(`Visitas (global): ${visitCount}`, 40, y); y += 14;
  doc.text(`Progreso: ${totalCompleted}/${totalItems} (${percentage}%)`, 40, y); y += 22;

  // --- Resumen por sección ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Resumen por sección', 40, y); y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  sections.forEach((section, idx) => {
    const title = section.querySelector('.section-header h3')?.innerText?.trim() || `Sección ${idx + 1}`;
    const checks = Array.from(section.querySelectorAll('.checklist-item input[type="checkbox"]'));
    const done = checks.filter((ch) => ch.checked).length;
    const total = checks.length;

    const line = `• ${title}: ${done}/${total}`;
    const split = doc.splitTextToSize(line, 520);

    if (y + split.length * 12 > 760) { doc.addPage(); y = 48; }
    doc.text(split, 40, y);
    y += split.length * 12 + 6;
  });

  // --- Ítems marcados (segunda página) ---
  doc.addPage();
  y = 48;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Ítems marcados', 40, y); y += 16;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  sections.forEach((section, idx) => {
    const title = section.querySelector('.section-header h3')?.innerText?.trim() || `Sección ${idx + 1}`;
    const marked = Array.from(section.querySelectorAll('.checklist-item'))
      .filter((el) => el.querySelector('input[type="checkbox"]').checked)
      .map((el) => el.querySelector('.item-text')?.innerText?.trim())
      .filter(Boolean);

    if (marked.length === 0) return;

    const header = `${title}`;
    const headerSplit = doc.splitTextToSize(header, 520);
    if (y + headerSplit.length * 14 > 760) { doc.addPage(); y = 48; }
    doc.setFont('helvetica', 'bold');
    doc.text(headerSplit, 40, y); y += headerSplit.length * 14 + 6;

    doc.setFont('helvetica', 'normal');
    marked.forEach((txt) => {
      const bullets = doc.splitTextToSize(`- ${txt}`, 520);
      if (y + bullets.length * 12 > 760) { doc.addPage(); y = 48; }
      doc.text(bullets, 54, y); y += bullets.length * 12 + 4;
    });
    y += 8;
  });

  // --- Guardar PDF ---
  doc.save('Progreso_Lista_Chequeo_TEC.pdf');
  showNotification('PDF generado correctamente', 'success');
}

// ---------------------------------------------------------
// UI: Felicitaciones / Notificaciones / Animaciones
// ---------------------------------------------------------
function showFinalCongratulations() {
  if (document.querySelector('.final-congratulations')) return;

  const finalCongratulations = document.createElement('div');
  finalCongratulations.className = 'final-congratulations';
  finalCongratulations.innerHTML = `
    <div class="final-congratulations-content">
      <div class="final-congratulations-icon">
        <i class="fas fa-trophy"></i>
      </div>
      <div class="final-congratulations-text">
        <h2>¡FELICITACIONES! 🎉</h2>
        <p>¡Has completado todo el informe!</p>
        <p class="final-subtitle">Tu informe está listo para entregar</p>
      </div>
    </div>
  `;
  finalCongratulations.style.cssText = `
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%) scale(0);
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white; padding: 40px; border-radius: 25px;
    box-shadow: 0 25px 50px rgba(102, 126, 234, 0.4);
    z-index: 10002; transition: all .6s cubic-bezier(.68,-.55,.265,1.55);
    max-width: 500px; text-align: center;
    border: 4px solid rgba(255,255,255,.3);
  `;
  document.body.appendChild(finalCongratulations);
  setTimeout(() => (finalCongratulations.style.transform = 'translate(-50%, -50%) scale(1)'), 100);
  createConfetti();
  setTimeout(() => {
    finalCongratulations.style.transform = 'translate(-50%, -50%) scale(0)';
    setTimeout(() => finalCongratulations.parentNode && finalCongratulations.parentNode.removeChild(finalCongratulations), 600);
  }, 6000);
}

function createConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
  const confettiCount = 100;
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => { createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]); }, i * 10);
  }
}

function createConfettiPiece(color) {
  const confetti = document.createElement('div');
  confetti.style.cssText = `
    position: fixed; width: 10px; height: 10px; background: ${color};
    top: -10px; left: ${Math.random() * 100}vw; z-index: 10001;
    animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
    transform: rotate(${Math.random() * 360}deg);
  `;
  document.body.appendChild(confetti);
  setTimeout(() => confetti.parentNode && confetti.parentNode.removeChild(confetti), 5000);
}

function showSectionCongratulations(sectionName) {
  const sectionNames = {
    'titulo': 'Título',
    'autoria': 'Autoría',
    'resumen': 'Resumen',
    'palabras-clave': 'Palabras clave',
    'introduccion': 'Introducción',
    'materiales-metodos': 'Materiales y métodos',
    'resultados': 'Resultados',
    'discusion': 'Discusión',
    'conclusiones': 'Conclusiones',
    'referencias': 'Referencias',
    'presentacion': 'Presentación y estilo general'
  };
  const display = sectionNames[sectionName] || sectionName;

  const el = document.createElement('div');
  el.className = 'congratulations-notification';
  el.innerHTML = `
    <div class="congratulations-content">
      <div class="congratulations-icon"><i class="fas fa-trophy"></i></div>
      <div class="congratulations-text">
        <h3>¡Felicidades! 🎉</h3>
        <p>Completaste <strong>${display}</strong></p>
      </div>
    </div>
  `;
  el.style.cssText = `
    position: fixed; top: 20px; right: 20px; transform: translateX(100%);
    background: linear-gradient(135deg, #48bb78, #38a169); color: white;
    padding: 20px; border-radius: 15px; box-shadow: 0 15px 35px rgba(72,187,120,.3);
    z-index: 10001; transition: transform .4s cubic-bezier(.68,-.55,.265,1.55);
    max-width: 350px; text-align: left; border: 2px solid rgba(255,255,255,.2);
  `;
  document.body.appendChild(el);
  setTimeout(() => (el.style.transform = 'translateX(0)'), 100);
  setTimeout(() => {
    el.style.transform = 'translateX(100%)';
    setTimeout(() => el.parentNode && el.parentNode.removeChild(el), 400);
  }, 4000);
}

function showNotification(message, type = 'info') {
  const n = document.createElement('div');
  n.className = `notification notification-${type}`;
  n.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  n.style.cssText = `
    position: fixed; top: 20px; right: 20px;
    background: ${type === 'success' ? 'linear-gradient(135deg, #48bb78, #38a169)' : 'linear-gradient(135deg, #667eea, #764ba2)'};
    color: white; padding: 15px 20px; border-radius: 10px; box-shadow: 0 8px 25px rgba(0,0,0,.2);
    z-index: 10000; transform: translateX(100%); transition: transform .3s ease; max-width: 300px;
  `;
  document.body.appendChild(n);
  setTimeout(() => (n.style.transform = 'translateX(0)'), 100);
  setTimeout(() => {
    n.style.transform = 'translateX(100%)';
    setTimeout(() => n.parentNode && n.parentNode.removeChild(n), 300);
  }, 3000);
}

function animateNumber(element, start, end, duration) {
  const startTime = performance.now();
  function updateNumber(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.round(start + (end - start) * progress);
    element.textContent = current;
    if (progress < 1) requestAnimationFrame(updateNumber);
  }
  requestAnimationFrame(updateNumber);
}

// Animaciones al cargar
window.addEventListener('load', function () {
  const visitCountElement = document.getElementById('visitCount');
  if (visitCountElement) animateNumber(visitCountElement, 0, visitCount, 800);

  setTimeout(() => {
    const totalCompleted = document.getElementById('totalCompleted');
    if (totalCompleted) {
      const completedCount = parseInt(totalCompleted.textContent || '0', 10);
      animateNumber(totalCompleted, 0, completedCount, 600);
    }
  }, 400);
});

// Estilos inyectados para notificaciones y animaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
  .notification-content{display:flex;align-items:center;gap:10px}
  .notification-content i{font-size:1.2rem}
  .congratulations-content{display:flex;align-items:center;gap:15px}
  .congratulations-icon{font-size:2.5rem;animation:bounce .6s ease-in-out;flex-shrink:0}
  .congratulations-text h3{margin:0 0 8px 0;font-size:1.3rem;font-weight:700}
  .congratulations-text p{margin:0;font-size:1rem;opacity:.9;line-height:1.3}
  .final-congratulations-content{display:flex;flex-direction:column;align-items:center;gap:20px}
  .final-congratulations-icon{font-size:4rem;animation:bounce .8s ease-in-out infinite}
  .final-congratulations-text h2{margin:0 0 15px 0;font-size:2.5rem;font-weight:800;text-shadow:2px 2px 4px rgba(0,0,0,.3)}
  .final-congratulations-text p{margin:0 0 10px 0;font-size:1.3rem;opacity:.95}
  .final-subtitle{font-size:1.1rem!important;opacity:.8!important;font-style:italic}
  @keyframes bounce{0%,20%,50%,80%,100%{transform:translateY(0)}40%{transform:translateY(-10px)}60%{transform:translateY(-5px)}}
  @keyframes confetti-fall{0%{transform:translateY(-100vh) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
`;
document.head.appendChild(notificationStyles);
