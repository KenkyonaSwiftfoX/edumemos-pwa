document.addEventListener("DOMContentLoaded", function () {
  // --- ENREGISTREMENT DU SERVICE WORKER ---
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) =>
        console.log("Service Worker enregistré avec succès !", reg),
      )
      .catch((err) =>
        console.warn("Erreur d'enregistrement du Service Worker", err),
      );
  }
  // ----------------------------------------

  // --- DEMANDE DE PERMISSION ---
  requestNotificationPermission();
  // ----------------------------------------

  function showNotification(title, message) {
    if (Notification.permission === "granted") {
      const options = {
        body: message,
        icon: "./icons/icon-192.png", // L'icône de ta PWA s'affichera dans la notification
        vibrate: [200, 100, 200], // Fait vibrer le téléphone (si supporté)
        badge: "./icons/icon-192.png", // Petite icône dans la barre de statut Android
      };

      // Déclenche la notification native
      new Notification(title, options);
    }
  }

  const notesContainer = document.getElementById("notesContainer");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const addNoteModal = document.getElementById("addNoteModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const noteForm = document.getElementById("noteForm");
  const searchInput = document.getElementById("searchInput");
  const filterSelect = document.getElementById("filterSelect");
  const emptyState = document.getElementById("emptyState");
  const confirmModal = document.getElementById("confirmModal");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let noteToDeleteId = null;

  renderNotes();
  updateEmptyState();

  addNoteBtn.addEventListener("click", openAddNoteModal);
  closeModalBtn.addEventListener("click", closeAddNoteModal);
  noteForm.addEventListener("submit", handleNoteSubmit);
  searchInput.addEventListener("input", filterNotes);
  filterSelect.addEventListener("change", filterNotes);
  cancelDeleteBtn.addEventListener("click", closeConfirmModal);
  confirmDeleteBtn.addEventListener("click", confirmDeleteNote);

  function renderNotes(notesToRender = notes) {
    notesContainer.innerHTML = "";

    notesToRender.forEach((note, index) => {
      const noteElement = document.createElement("div");
      noteElement.className = "note-card fade-in";
      noteElement.innerHTML = `
            <div class="note-content">
                <div class="note-header">
                    <h3 class="note-title">${note.title}</h3>
                    <div class="note-actions">
                        <button class="delete-btn" data-id="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="note-text">${note.content}</p>
                <div class="note-footer">
                    <span class="note-tag ${getTagClass(note.tag)}">
                        ${getTagIcon(note.tag)} ${getTagName(note.tag)}
                    </span>
                    <span class="note-date">${formatDate(note.date)}</span>
                </div>
            </div>`;
      notesContainer.appendChild(noteElement);
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        noteToDeleteId = parseInt(this.getAttribute("data-id"));
        openConfirmModal();
      });
    });
  }

  function getTagClass(tag) {
    const classes = {
      entraideProgrammation: "tag-entraideProgrammation",
      ressources: "tag-ressources",
      infosPromo: "tag-infosPromo",
      flashcards: "tag-flashcards",
    };
    return classes[tag] || "";
  }

  function getTagIcon(tag) {
    const icons = {
      entraideProgrammation: '<i class="fas fa-briefcase"></i>',
      ressources: '<i class="fas fa-user"></i>',
      infosPromo: '<i class="fas fa-lightbulb"></i>',
      flashcards: '<i class="fas fa-bell"></i>',
    };
    return icons[tag] || "";
  }

  function getTagName(tag) {
    const names = {
      entraideProgrammation: "Entraide Programmation",
      ressources: "Ressources",
      infosPromo: "Infos Promo",
      flashcards: "Flashcards",
    };
    return names[tag] || tag;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function openAddNoteModal() {
    addNoteModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeAddNoteModal() {
    addNoteModal.classList.remove("active");
    document.body.style.overflow = "auto";
    noteForm.reset();
  }

  function openConfirmModal() {
    confirmModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeConfirmModal() {
    confirmModal.classList.remove("active");
    document.body.style.overflow = "auto";
    noteToDeleteId = null;
  }

  function handleNoteSubmit(e) {
    e.preventDefault();

    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;
    const tag = document.querySelector('input[name="noteTag"]:checked').value;

    const newNote = {
      title,
      content,
      tag,
      date: new Date().toISOString(),
    };

    notes.unshift(newNote);
    saveNotes();
    renderNotes();
    closeAddNoteModal();
    updateEmptyState();
    filterNotes();

    // --- AJOUT DE LA NOTIFICATION ---
    // On récupère le nom propre du tag pour l'afficher proprement
    const nomTag = getTagName(tag);
    showNotification(
      "Nouveau mémo publié !",
      `Un étudiant a partagé : "${title}" dans la catégorie ${nomTag}.`,
    );
    // --------------------------------
  }

  function confirmDeleteNote() {
    if (noteToDeleteId !== null) {
      notes.splice(noteToDeleteId, 1);
      saveNotes();
      renderNotes();
      updateEmptyState();
      filterNotes();
      closeConfirmModal();
    }
  }

  function saveNotes() {
    localStorage.setItem("notes", JSON.stringify(notes));
  }

  function filterNotes() {
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterSelect.value;

    let filteredNotes = notes;

    if (searchTerm) {
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm) ||
          note.content.toLowerCase().includes(searchTerm),
      );
    }

    if (filterValue !== "all") {
      filteredNotes = filteredNotes.filter((note) => note.tag === filterValue);
    }

    renderNotes(filteredNotes);
    updateEmptyState(filteredNotes);
  }

  function updateEmptyState(notesToCheck = notes) {
    if (notesToCheck.length === 0) {
      emptyState.style.display = "block";
    } else {
      emptyState.style.display = "none";
    }
  }

  function requestNotificationPermission() {
    if (!("Notification" in window)) {
      console.log(
        "Ce navigateur ne prend pas en charge les notifications de bureau.",
      );
      return;
    }

    // SI DÉJÀ ACCORDÉE : On peut envoyer un petit message de synchronisation
    if (Notification.permission === "granted") {
      console.log("Les notifications sont déjà actives.");
      // Optionnel : showNotification("EduMémos", "Flux synchronisé connecté !");
    }
    // SI PAS ENCORE DEMANDÉE : On demande la permission
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Permission pour les notifications accordée !");
          showNotification(
            "EduMémos",
            "Merci d'avoir activé les notifications de la promo !",
          );
        }
      });
    }
  }
});
