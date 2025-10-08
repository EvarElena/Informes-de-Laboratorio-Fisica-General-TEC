// Variables globales
let visitCount = 0;
let checklistData = {};

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    initializeVisitCounter();
    initializeChecklist();
    initializeModal();
    initializeActionButtons();
});

// Contador de visitas
function initializeVisitCounter() {
    // Obtener contador del localStorage
    const storedCount = localStorage.getItem('visitCount');
    visitCount = storedCount ? parseInt(storedCount) : 0;
    
    // Incrementar contador
    visitCount++;
    
    // Guardar en localStorage
    localStorage.setItem('visitCount', visitCount.toString());
    
    // Actualizar en la interfaz
    document.getElementById('visitCount').textContent = visitCount;
}

// Inicializar checklist
function initializeChecklist() {
    // Cargar datos guardados
    loadChecklistData();
    
    // Configurar event listeners para checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateSectionProgress(this);
            updateOverallProgress();
            saveChecklistData();
        });
    });
    
    // Actualizar progreso inicial
    updateOverallProgress();
}

// Actualizar progreso de sección
function updateSectionProgress(checkbox) {
    const section = checkbox.closest('.checklist-section');
    const sectionName = section.dataset.section;
    const checkboxes = section.querySelectorAll('input[type="checkbox"]');
    const checkedBoxes = section.querySelectorAll('input[type="checkbox"]:checked');
    
    const total = checkboxes.length;
    const completed = checkedBoxes.length;
    const percentage = (completed / total) * 100;
    
    // Actualizar texto de progreso
    const progressText = section.querySelector('.progress-text');
    progressText.textContent = `${completed}/${total}`;
    
    // Actualizar barra de progreso
    const progressFill = section.querySelector('.progress-fill');
    progressFill.style.width = `${percentage}%`;
    
    // Cambiar color de la barra según el progreso
    if (percentage === 100) {
        progressFill.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
        
        // Mostrar felicitaciones cuando se complete una sección
        showSectionCongratulations(sectionName);
    } else if (percentage >= 50) {
        progressFill.style.background = 'linear-gradient(135deg, #ed8936, #dd6b20)';
    } else {
        progressFill.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    }
}

// Actualizar progreso general
function updateOverallProgress() {
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    const allCheckedBoxes = document.querySelectorAll('input[type="checkbox"]:checked');
    
    const totalItems = allCheckboxes.length;
    const completedItems = allCheckedBoxes.length;
    const percentage = (completedItems / totalItems) * 100;
    
    // Actualizar estadísticas
    document.getElementById('totalCompleted').textContent = completedItems;
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('completionPercentage').textContent = `${Math.round(percentage)}%`;
    
    // Actualizar barra de progreso general
    const overallProgressFill = document.getElementById('overallProgressFill');
    overallProgressFill.style.width = `${percentage}%`;
    
    // Cambiar color según el progreso
    if (percentage === 100) {
        overallProgressFill.style.background = 'rgba(72, 187, 120, 0.8)';
        
        // Mostrar mensaje final con confeti cuando se complete todo
        showFinalCongratulations();
    } else if (percentage >= 75) {
        overallProgressFill.style.background = 'rgba(237, 137, 54, 0.8)';
    } else if (percentage >= 50) {
        overallProgressFill.style.background = 'rgba(237, 137, 54, 0.8)';
    } else {
        overallProgressFill.style.background = 'rgba(102, 126, 234, 0.8)';
    }
}

// Guardar datos del checklist
function saveChecklistData() {
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    const data = {};
    
    allCheckboxes.forEach(checkbox => {
        data[checkbox.dataset.item] = checkbox.checked;
    });
    
    localStorage.setItem('checklistData', JSON.stringify(data));
}

// Cargar datos del checklist
function loadChecklistData() {
    const storedData = localStorage.getItem('checklistData');
    if (storedData) {
        const data = JSON.parse(storedData);
        
        Object.keys(data).forEach(itemId => {
            const checkbox = document.querySelector(`input[data-item="${itemId}"]`);
            if (checkbox) {
                checkbox.checked = data[itemId];
            }
        });
        
        // Actualizar progreso de todas las secciones
        const sections = document.querySelectorAll('.checklist-section');
        sections.forEach(section => {
            const checkboxes = section.querySelectorAll('input[type="checkbox"]');
            if (checkboxes.length > 0) {
                updateSectionProgress(checkboxes[0]);
            }
        });
    }
}

// Inicializar modal
function initializeModal() {
    const modal = document.getElementById('guideModal');
    const btn = document.getElementById('guideButton');
    const span = document.getElementsByClassName('close')[0];
    
    btn.onclick = function() {
        modal.style.display = 'block';
    }
    
    span.onclick = function() {
        modal.style.display = 'none';
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
}

// Inicializar botones de acción
function initializeActionButtons() {
    // Botón limpiar todo
    document.getElementById('clearAll').addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el progreso? Esta acción no se puede deshacer.')) {
            const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
            allCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Actualizar todas las secciones
            const sections = document.querySelectorAll('.checklist-section');
            sections.forEach(section => {
                const checkboxes = section.querySelectorAll('input[type="checkbox"]');
                if (checkboxes.length > 0) {
                    updateSectionProgress(checkboxes[0]);
                }
            });
            
            updateOverallProgress();
            saveChecklistData();
            
            // Mostrar mensaje de confirmación
            showNotification('Progreso limpiado exitosamente', 'success');
        }
    });
    
    // Botón exportar progreso
    document.getElementById('exportProgress').addEventListener('click', function() {
        exportProgress();
    });
}

// Exportar progreso
function exportProgress() {
    const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');
    const sections = document.querySelectorAll('.checklist-section');
    
    let exportData = {
        fecha: new Date().toLocaleString('es-ES'),
        visitas: visitCount,
        progreso: {
            total: allCheckboxes.length,
            completados: document.querySelectorAll('input[type="checkbox"]:checked').length,
            porcentaje: Math.round((document.querySelectorAll('input[type="checkbox"]:checked').length / allCheckboxes.length) * 100)
        },
        secciones: {}
    };
    
    sections.forEach(section => {
        const sectionName = section.dataset.section;
        const checkboxes = section.querySelectorAll('input[type="checkbox"]');
        const checkedBoxes = section.querySelectorAll('input[type="checkbox"]:checked');
        
        exportData.secciones[sectionName] = {
            total: checkboxes.length,
            completados: checkedBoxes.length,
            porcentaje: Math.round((checkedBoxes.length / checkboxes.length) * 100),
            items: []
        };
        
        checkboxes.forEach(checkbox => {
            exportData.secciones[sectionName].items.push({
                texto: checkbox.nextElementSibling.nextElementSibling.textContent,
                completado: checkbox.checked
            });
        });
    });
    
    // Crear y descargar archivo
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `progreso_informe_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Progreso exportado exitosamente', 'success');
}

// Mostrar mensaje final con confeti cuando se complete todo
function showFinalCongratulations() {
    // Verificar si ya se mostró el mensaje final para evitar duplicados
    if (document.querySelector('.final-congratulations')) {
        return;
    }
    
    // Crear elemento de felicitación final
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
    
    // Estilos de la felicitación final
    finalCongratulations.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 40px;
        border-radius: 25px;
        box-shadow: 0 25px 50px rgba(102, 126, 234, 0.4);
        z-index: 10002;
        transition: all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 500px;
        text-align: center;
        border: 4px solid rgba(255, 255, 255, 0.3);
    `;
    
    // Agregar al DOM
    document.body.appendChild(finalCongratulations);
    
    // Animar entrada
    setTimeout(() => {
        finalCongratulations.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 100);
    
    // Crear confeti
    createConfetti();
    
    // Remover después de 6 segundos
    setTimeout(() => {
        finalCongratulations.style.transform = 'translate(-50%, -50%) scale(0)';
        setTimeout(() => {
            if (finalCongratulations.parentNode) {
                finalCongratulations.parentNode.removeChild(finalCongratulations);
            }
        }, 600);
    }, 6000);
}

// Crear efecto de confeti
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    const confettiCount = 100;
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
        }, i * 10);
    }
}

// Crear una pieza de confeti
function createConfettiPiece(color) {
    const confetti = document.createElement('div');
    confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${color};
        top: -10px;
        left: ${Math.random() * 100}vw;
        z-index: 10001;
        animation: confetti-fall ${2 + Math.random() * 3}s linear forwards;
        transform: rotate(${Math.random() * 360}deg);
    `;
    
    document.body.appendChild(confetti);
    
    // Remover confeti después de la animación
    setTimeout(() => {
        if (confetti.parentNode) {
            confetti.parentNode.removeChild(confetti);
        }
    }, 5000);
}

// Mostrar felicitaciones por sección completada
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
    
    const sectionDisplayName = sectionNames[sectionName] || sectionName;
    
    // Crear elemento de felicitación
    const congratulations = document.createElement('div');
    congratulations.className = 'congratulations-notification';
    congratulations.innerHTML = `
        <div class="congratulations-content">
            <div class="congratulations-icon">
                <i class="fas fa-trophy"></i>
            </div>
            <div class="congratulations-text">
                <h3>¡Felicidades! 🎉</h3>
                <p>Completaste <strong>${sectionDisplayName}</strong></p>
            </div>
        </div>
    `;
    
    // Estilos de la felicitación
    congratulations.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        transform: translateX(100%);
        background: linear-gradient(135deg, #48bb78, #38a169);
        color: white;
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 15px 35px rgba(72, 187, 120, 0.3);
        z-index: 10001;
        transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        max-width: 350px;
        text-align: left;
        border: 2px solid rgba(255, 255, 255, 0.2);
    `;
    
    // Agregar al DOM
    document.body.appendChild(congratulations);
    
    // Animar entrada
    setTimeout(() => {
        congratulations.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        congratulations.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (congratulations.parentNode) {
                congratulations.parentNode.removeChild(congratulations);
            }
        }, 400);
    }, 4000);
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Estilos de la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #48bb78, #38a169)' : 'linear-gradient(135deg, #667eea, #764ba2)'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para animar números
function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.round(start + (end - start) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Agregar efectos de animación al cargar
window.addEventListener('load', function() {
    // Animar contador de visitas
    const visitCountElement = document.getElementById('visitCount');
    animateNumber(visitCountElement, 0, visitCount, 1000);
    
    // Animar estadísticas generales
    setTimeout(() => {
        const totalCompleted = document.getElementById('totalCompleted');
        const completedCount = parseInt(totalCompleted.textContent);
        animateNumber(totalCompleted, 0, completedCount, 800);
    }, 500);
});

// Agregar estilos para notificaciones y felicitaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-content i {
        font-size: 1.2rem;
    }
    
    .congratulations-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .congratulations-icon {
        font-size: 2.5rem;
        animation: bounce 0.6s ease-in-out;
        flex-shrink: 0;
    }
    
    .congratulations-text h3 {
        margin: 0 0 8px 0;
        font-size: 1.3rem;
        font-weight: 700;
    }
    
    .congratulations-text p {
        margin: 0;
        font-size: 1rem;
        opacity: 0.9;
        line-height: 1.3;
    }
    
    .final-congratulations-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    }
    
    .final-congratulations-icon {
        font-size: 4rem;
        animation: bounce 0.8s ease-in-out infinite;
    }
    
    .final-congratulations-text h2 {
        margin: 0 0 15px 0;
        font-size: 2.5rem;
        font-weight: 800;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    .final-congratulations-text p {
        margin: 0 0 10px 0;
        font-size: 1.3rem;
        opacity: 0.95;
    }
    
    .final-subtitle {
        font-size: 1.1rem !important;
        opacity: 0.8 !important;
        font-style: italic;
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        60% {
            transform: translateY(-5px);
        }
    }
    
    @keyframes confetti-fall {
        0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);
// ===== Exportar Progreso a PDF con jsPDF =====
(function () {
  const btn = document.getElementById('exportProgress');
  if (!btn) return;

  // Evita handlers duplicados si ya existía alguno
  btn.replaceWith(btn.cloneNode(true));
  const freshBtn = document.getElementById('exportProgress');
  freshBtn.addEventListener('click', exportProgressToPDF);

  function exportProgressToPDF() {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert('No se cargó jsPDF. Verifique la etiqueta <script> del CDN.');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'letter' }); // Carta (8.5x11in)

    // --- Recolección de datos del DOM ---
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
      const done = checks.filter(ch => ch.checked).length;
      const total = checks.length;

      const line = `• ${title}: ${done}/${total}`;
      const split = doc.splitTextToSize(line, 520);

      if (y + split.length * 12 > 760) { doc.addPage(); y = 48; }
      doc.text(split, 40, y);
      y += split.length * 12 + 6;
    });

    // --- (Opcional) Listado de ítems marcados ---
    // Descomente si desea incluir cada ítem marcado.
    /*
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
        .filter(el => el.querySelector('input[type="checkbox"]').checked)
        .map(el => el.querySelector('.item-text')?.innerText?.trim())
        .filter(Boolean);

      if (marked.length === 0) return;

      const header = `${title}`;
      const headerSplit = doc.splitTextToSize(header, 520);
      if (y + headerSplit.length * 14 > 760) { doc.addPage(); y = 48; }
      doc.setFont('helvetica', 'bold');
      doc.text(headerSplit, 40, y); y += headerSplit.length * 14 + 6;

      doc.setFont('helvetica', 'normal');
      marked.forEach(txt => {
        const bullets = doc.splitTextToSize(`- ${txt}`, 520);
        if (y + bullets.length * 12 > 760) { doc.addPage(); y = 48; }
        doc.text(bullets, 54, y); y += bullets.length * 12 + 4;
      });
      y += 8;
    });
    */

    // --- Guardar PDF ---
    doc.save('Progreso_Lista_Chequeo_TEC.pdf');
  }
})();
