const sidebar = document.getElementById('vertical-navbar');
const toggleBtn = document.getElementById('toggle-btn');
const toggleIcon = document.getElementById('toggle-icon');

toggleBtn.addEventListener('click', () => {
    // Toggle sidebar position
    sidebar.classList.toggle('-translate-x-full');

    // Update chevron arrow depending on state
    const isOpen = !sidebar.classList.contains('-translate-x-full');
    toggleIcon.textContent = isOpen ? '‹' : '›';
});

const btnSearch = document.getElementById("search-btn")

const pattern = /^[\p{L}\p{N} _.\-]{3,16}#[\p{L}\p{N}]{3,5}$/u

btnSearch.addEventListener("click", async () => {
    const inputRiotAccount = document.getElementById("inputRiotAccount")
    const selectServer = document.getElementById("selectServer")

    if (inputRiotAccount.value === "") {
        showToast("User input is empty!")

    }

    else if (!pattern.test(inputRiotAccount.value)) {
        showToast("User input does not match any RIOT ID format")
    }

    const [gameName, tagLine] = inputRiotAccount.value.split("#")
    //DEBUG
    console.log(inputRiotAccount.value)
    console.log(gameName, tagLine)

    const params = new URLSearchParams({
        gameName: gameName.trim(),
        tagLine: tagLine.trim(),
        server: selectServer.value
    });

    try {
        if (gameName === "") throw new Error("Game name is empty")
        else if (tagLine === "") throw new Error("Tag line is empty")
        else if (selectServer.value === "") {
            showToast("There is no Server selected!")
            throw new Error("There is no Server selected!")
        }

        const response = await fetch(`http://localhost:2106/riot/account?${params}`)



        if (!response.ok) {
            console.log(`API STATUS: ${response.status}`)
        }
        return response.json()
    }
    catch (error) {
        throw new Error(`An Error Has Occurred: ${error.message}`)
    }
})



// AI GENERATED SNIPPETS ---------------------------------------------------------
function showToast(message, type = 'error', duration = 4000) {
    const container = document.getElementById('toast-container');

    // 1. Create Toast Div
    const toast = document.createElement('div');

    // Base classes + variant styling
    const typeStyles = type === 'error'
        ? 'bg-red-950/90 border-red-800 text-red-200'
        : 'bg-emerald-950/90 border-emerald-800 text-emerald-200';

    toast.className = `pointer-events-auto flex items-center justify-between p-4 rounded-lg shadow-xl border backdrop-blur-md transition-all duration-300 transform translate-y-4 opacity-0 ${typeStyles}`;

    // 2. Set Toast Content
    toast.innerHTML = `
    <div class="flex items-center space-x-3">
      <span class="text-lg shrink-0">${type === 'error' ? '⚠️' : '✅'}</span>
      <p class="text-sm font-medium leading-snug">${message}</p>
    </div>
    <button class="ml-4 text-slate-400 hover:text-white font-bold text-lg leading-none focus:outline-none p-1">&times;</button>
  `;

    // 3. Append to Container
    container.appendChild(toast);

    // 4. Animate Entrance (Trigger CSS Transition)
    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-4', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    });

    // 5. Dismiss Handler
    const dismissToast = () => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-4');
        // Remove element from DOM after fade animation completes
        setTimeout(() => toast.remove(), 300);
    };

    // Auto-dismiss timer
    const autoDismissTimer = setTimeout(dismissToast, duration);

    // Manual dismiss on button click
    toast.querySelector('button').addEventListener('click', () => {
        clearTimeout(autoDismissTimer);
        dismissToast();
    });
}