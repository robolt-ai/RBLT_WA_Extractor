document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"]
  });

  chrome.tabs.sendMessage(tab.id, { type: "get_whatsapp_data" }, (response) => {
    if (!response?.success) {
      document.body.innerHTML = `<p>Error: ${response?.error || 'Could not fetch data from WhatsApp. Please ensure web.whatsapp.com is the active tab and reload.'}</p>`;
      return;
    }

    const { groups, participants, contacts } = response.data;

    // ---------------- LID -> PHONE MAP ----------------
    const lidToPhone = new Map();
    contacts.forEach(c => {
      if (
        typeof c.id === "string" &&
        c.id.endsWith("@lid") &&
        typeof c.phoneNumber === "string" &&
        c.phoneNumber.endsWith("@c.us")
      ) {
        lidToPhone.set(c.id, c.phoneNumber);
      }
    });
    // --------------------------------------------------

    const groupList = document.getElementById("group-list");
    const exportZipBtn = document.getElementById("export-zip-btn");

    let selectedGroupIds = new Set();

    groups.forEach(group => {
      const groupItem = document.createElement("div");
      groupItem.className = "group-item";

      const label = document.createElement("label");

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = group.id;
      checkbox.dataset.groupName = group.subject;

      const groupName = document.createElement("span");
      groupName.className = "group-name";
      groupName.textContent = group.subject || "Unnamed Group";

      label.appendChild(checkbox);
      label.appendChild(groupName);
      groupItem.appendChild(label);
      groupList.appendChild(groupItem);
    });

    groupList.addEventListener("change", (event) => {
      if (event.target.type === "checkbox") {
        if (event.target.checked) {
          selectedGroupIds.add(event.target.value);
        } else {
          selectedGroupIds.delete(event.target.value);
        }
        exportZipBtn.disabled = selectedGroupIds.size === 0;
      }
    });

    exportZipBtn.onclick = () => {
      if (selectedGroupIds.size === 0) {
        alert("Please select at least one group to export.");
        return;
      }

      const zip = new JSZip();

      selectedGroupIds.forEach(groupId => {
        const group = groups.find(g => g.id === groupId);
        const part = participants.find(p => p.groupId === groupId);

        if (!group || !part) return;

        const participantData = part.participants.map(id => {
          let resolvedPhone = "";

          if (typeof id === "string") {
            if (id.endsWith("@c.us")) {
              resolvedPhone = id.replace("@c.us", "");
            }
            else if (id.endsWith("@lid") && lidToPhone.has(id)) {
              resolvedPhone = lidToPhone.get(id).replace("@c.us", "");
            }
            else {
              resolvedPhone = id;
            }
          }

          const contact = contacts.find(c =>
            c.phoneNumber === resolvedPhone + "@c.us" || c.id === id
          );

          return {
            phoneNumber: resolvedPhone,
            name: contact?.pushname || contact?.name || "Unknown",
            isSaved: contact?.isAddressBookContact ? "Yes" : "No"
          };
        });

        if (participantData.length > 0) {
          const groupName = group.subject || `Unknown_Group_${groupId}`;
          const safeFileName = groupName.replace(/[\/:*?"<>|]/g, "_") + ".csv";
          const csvContent = generateCSV(participantData);
          zip.file(safeFileName, csvContent);
        }
      });

      zip.generateAsync({ type: "blob" })
        .then(blob => {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = "WhatsApp_Groups_Export.zip";
          link.click();
          URL.revokeObjectURL(link.href);
        })
        .catch(err => {
          console.error("ZIP error:", err);
          alert("Failed to create ZIP file.");
        });
    };
  });
});

function generateCSV(data) {
  const header = ["Phone Number", "Name", "Is Saved"];
  const rows = data.map(row => [
    `"${row.phoneNumber}"`,
    `"${(row.name || "").replace(/"/g, '""')}"`,
    `"${row.isSaved}"`
  ]);

  return [header.join(","), ...rows.map(r => r.join(","))].join("\n");
}
