/* =========================================================
   ATOMIA ⚛️
   JavaScript principal
   ========================================================= */


/* =========================================================
   1. VARIABLES PRINCIPALES
   ========================================================= */

// Tous les éléments contenus dans elements.json
let elements = [];

// Tous les ions contenus dans ions.json
let ions = [];

// Les 4 fichiers de nucléides
let nuclides = [];

// Éléments HTML dont nous avons besoin
const periodicTable = document.getElementById("periodic-table");
const searchInput = document.getElementById("search");
const elementView = document.getElementById("element-view");


/* =========================================================
   2. CHARGEMENT DES DONNÉES
   ========================================================= */

/*
   fetch() permet à JavaScript de récupérer un fichier.

   Exemple :
   fetch("data/elements.json")

   signifie :
   "Va chercher elements.json dans le dossier data".
*/

async function loadData() {

    try {

        // Chargement des éléments
        const elementsResponse =
            await fetch("data/elements.json");

        elements = await elementsResponse.json();


        // Chargement des ions
        const ionsResponse =
            await fetch("data/ions.json");

        ions = await ionsResponse.json();


        /*
           Les nucléides sont répartis dans 4 fichiers.

           Promise.all() permet de charger plusieurs fichiers
           en même temps au lieu d'attendre chaque fichier
           l'un après l'autre.
        */

        const nuclideFiles = [
            "data/nuclides-1.json",
            "data/nuclides-2.json",
            "data/nuclides-3.json",
            "data/nuclides-4.json"
        ];

        const nuclideResponses =
            await Promise.all(
                nuclideFiles.map(file => fetch(file))
            );


        /*
           On transforme les 4 réponses HTTP en données JSON.
        */

        const nuclideData =
            await Promise.all(
                nuclideResponses.map(
                    response => response.json()
                )
            );


        /*
           nuclideData contient maintenant 4 tableaux.

           flat() les rassemble en un seul tableau.
        */

        nuclides = nuclideData.flat();


        console.log("⚛️ ATOMIA chargé !");
        console.log("Éléments :", elements.length);
        console.log("Ions :", ions.length);
        console.log("Nucléides :", nuclides.length);


        // On construit le tableau
        createPeriodicTable();


    } catch (error) {

        console.error(
            "Erreur lors du chargement des données :",
            error
        );

        periodicTable.innerHTML = `
            <p class="error">
                Impossible de charger les données d'ATOMIA.
            </p>
        `;
    }
}


/* =========================================================
   3. CRÉATION DU TABLEAU PÉRIODIQUE
   ========================================================= */

function createPeriodicTable() {

    // On vide le tableau avant de le reconstruire
    periodicTable.innerHTML = "";


    /*
       On parcourt les 118 éléments.

       forEach() exécute la fonction une fois
       pour chaque élément.
    */

    elements.forEach(element => {

        // Création d'une nouvelle case HTML
        const cell = document.createElement("div");


        /*
           "element" sera la classe générale.

           Ensuite on ajoute la catégorie chimique.

           Exemple pour le fer :

           class="element transition-metal"
        */

        cell.classList.add(
            "element",
            element.category
        );


        /*
           Position dans la grille CSS.

           group = colonne
           period = ligne
        */

        if (element.group) {
            cell.style.gridColumn = element.group;
        }

        if (element.period) {
            cell.style.gridRow = element.period;
        }


        /*
           Cas particulier des lanthanides et actinides.

           On les place sur les deux lignes situées
           sous le tableau principal.
        */

        if (element.category === "lanthanide") {

            const position =
                getFBlockPosition(element, 8);

            cell.style.gridColumn = position;

            cell.style.gridRow = 8;
        }

        if (element.category === "actinide") {

            const position =
                getFBlockPosition(element, 9);

            cell.style.gridColumn = position;

            cell.style.gridRow = 9;
        }


        /*
           Contenu de la case.

           textContent est utilisé pour les données venant
           du JSON : cela évite d'interpréter leur contenu
           comme du HTML.
        */

        cell.innerHTML = `
            <span class="atomic-number">
                ${element.atomicNumber}
            </span>

            <span class="symbol">
                ${element.symbol}
            </span>

            <span class="name">
                ${element.name}
            </span>

            <span class="atomic-mass">
                ${formatAtomicMass(element.atomicMass)}
            </span>
        `;


        /*
           Une case est cliquable.

           Quand on clique dessus, on appelle
           showElement().
        */

        cell.addEventListener("click", () => {
            showElement(element);
        });


        /*
           Accessibilité clavier.

           On rend la case utilisable avec TAB.
        */

        cell.setAttribute("tabindex", "0");

        cell.addEventListener("keydown", event => {

            if (event.key === "Enter" ||
                event.key === " ") {

                event.preventDefault();

                showElement(element);
            }
        });


        // Ajout de la case dans le tableau
        periodicTable.appendChild(cell);

    });
}


/* =========================================================
   4. POSITION DES LANTHANIDES / ACTINIDES
   ========================================================= */

function getFBlockPosition(element, row) {

    /*
       Les lanthanides vont de La à Lu.

       Les actinides vont de Ac à Lr.

       On récupère leur numéro atomique pour déterminer
       leur position horizontale.

       On commence à la colonne 4.
    */

    if (element.category === "lanthanide") {

        return element.atomicNumber - 57 + 4;
    }

    if (element.category === "actinide") {

        return element.atomicNumber - 89 + 4;
    }

    return 4;
}


/* =========================================================
   5. FORMATAGE DE LA MASSE ATOMIQUE
   ========================================================= */

function formatAtomicMass(mass) {

    if (mass === null ||
        mass === undefined) {

        return "—";
    }

    return mass;
}


/* =========================================================
   6. AFFICHAGE D'UN ÉLÉMENT
   ========================================================= */

function showElement(element) {

    /*
       On récupère les nucléides correspondant
       à cet élément.
    */

    const elementNuclides =
        nuclides.filter(nuclide => {

            /*
               On accepte plusieurs noms possibles
               pour identifier l'élément.

               Cela rend le code plus robuste si ton
               générateur Python utilise "element"
               ou "symbol".
            */

            return (
                nuclide.element === element.symbol ||
                nuclide.symbol === element.symbol
            );
        });


    /*
       On récupère les ions correspondant à l'élément.
    */

    const elementIons =
        ions.filter(ion =>
            ion.element === element.symbol
        );


    /*
       Construction de la fiche.
    */

    elementView.innerHTML = `

        <div class="element-header">

            <div class="big-symbol">
                ${element.symbol}
            </div>

            <div>

                <h2>
                    ${element.name}
                </h2>

                <p>
                    Numéro atomique :
                    <strong>${element.atomicNumber}</strong>
                </p>

            </div>

        </div>


        <div class="element-info">

            <div class="info-card">
                <span>Symbole</span>
                <strong>${element.symbol}</strong>
            </div>

            <div class="info-card">
                <span>Numéro atomique</span>
                <strong>${element.atomicNumber}</strong>
            </div>

            <div class="info-card">
                <span>Masse atomique</span>
                <strong>
                    ${formatAtomicMass(element.atomicMass)}
                </strong>
            </div>

            <div class="info-card">
                <span>État à température ambiante</span>
                <strong>
                    ${element.stateAtRoomTemperature ?? "—"}
                </strong>
            </div>

            <div class="info-card">
                <span>Point de fusion</span>
                <strong>
                    ${formatValue(element.meltingPoint, "°C")}
                </strong>
            </div>

            <div class="info-card">
                <span>Point d'ébullition</span>
                <strong>
                    ${formatValue(element.boilingPoint, "°C")}
                </strong>
            </div>

            <div class="info-card">
                <span>Densité</span>
                <strong>
                    ${formatValue(element.density, "g/cm³")}
                </strong>
            </div>

            <div class="info-card">
                <span>Configuration électronique</span>
                <strong>
                    ${element.electronConfiguration ?? "—"}
                </strong>
            </div>

        </div>


        <div class="element-section">

            <h3>⚛️ Électrons par couche</h3>

            <p>
                ${
                    element.electronsPerShell
                    ? element.electronsPerShell.join(" • ")
                    : "—"
                }
            </p>

        </div>


        <div class="element-section">

            <h3>🌍 Où trouve-t-on cet élément ?</h3>

            ${
                createList(
                    element.commonOccurrences
                )
            }

        </div>


        <div class="element-section">

            <h3>🔧 Utilisations</h3>

            ${
                createList(
                    element.commonUses
                )
            }

        </div>


        <div class="element-section">

            <h3>☢️ Nucléides</h3>

            <div class="nuclide-list">

                ${
                    createNuclideList(
                        elementNuclides
                    )
                }

            </div>

        </div>


        <div class="element-section">

            <h3>⚡ Ions</h3>

            <div class="ion-list">

                ${
                    createIonList(
                        elementIons
                    )
                }

            </div>

        </div>


        <button
            class="close-element"
            id="close-element">
            Fermer
        </button>
    `;


    /*
       On retire "hidden".

       La fiche devient donc visible.
    */

    elementView.classList.remove("hidden");


    /*
       Le bouton Fermer cache la fiche.
    */

    document
        .getElementById("close-element")
        .addEventListener("click", () => {

            elementView.classList.add("hidden");

            /*
               Retour en haut de la fiche/tableau.
            */

            elementView.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });


    /*
       On amène automatiquement l'utilisateur
       vers la fiche.
    */

    elementView.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   7. LISTES
   ========================================================= */

function createList(items) {

    if (!items || items.length === 0) {
        return "<p>—</p>";
    }


    return `
        <ul>
            ${
                items.map(item => `
                    <li>${item}</li>
                `).join("")
            }
        </ul>
    `;
}


/* =========================================================
   8. NUCLÉIDES
   ========================================================= */

function createNuclideList(list) {

    if (list.length === 0) {
        return "<p>Aucun nucléide trouvé.</p>";
    }


    /*
       On trie les nucléides par nombre de masse.
    */

    const sorted =
        [...list].sort(
            (a, b) =>
                a.massNumber - b.massNumber
        );


    return sorted.map(nuclide => {

        const protons =
            nuclide.protons ??
            nuclide.atomicNumber;

        const neutrons =
            nuclide.neutrons ??
            (
                nuclide.massNumber -
                protons
            );


        return `
            <div class="nuclide-card">

                <strong>
                    ${nuclide.id}
                </strong>

                <span>
                    A = ${nuclide.massNumber}
                </span>

                <span>
                    Protons : ${protons}
                </span>

                <span>
                    Neutrons : ${neutrons}
                </span>

            </div>
        `;

    }).join("");
}


/* =========================================================
   9. IONS
   ========================================================= */

function createIonList(list) {

    if (list.length === 0) {
        return "<p>Aucun ion enregistré.</p>";
    }


    /*
       Tri par charge.
    */

    const sorted =
        [...list].sort(
            (a, b) =>
                a.charge - b.charge
        );


    return sorted.map(ion => {

        /*
           Les protons correspondent toujours
           au numéro atomique.
        */

        const protons =
            ion.atomicNumber;


        /*
           Formule fondamentale :

           électrons = Z - charge

           Exemple :

           Fe³⁺
           26 - 3 = 23

           Cl⁻
           17 - (-1) = 18
        */

        const electrons =
            ion.atomicNumber -
            ion.charge;


        return `
            <div class="ion-card">

                <strong>
                    ${ion.id}
                </strong>

                <span>
                    Charge : ${formatCharge(ion.charge)}
                </span>

                <span>
                    Protons : ${protons}
                </span>

                <span>
                    Électrons : ${electrons}
                </span>

            </div>
        `;

    }).join("");
}


/* =========================================================
   10. FORMATAGE DES CHARGES
   ========================================================= */

function formatCharge(charge) {

    if (charge > 0) {

        return "+" + charge;
    }

    return charge;
}


/* =========================================================
   11. FORMATAGE DES VALEURS
   ========================================================= */

function formatValue(value, unit) {

    if (value === null ||
        value === undefined) {

        return "—";
    }

    return `${value} ${unit}`;
}


/* =========================================================
   12. RECHERCHE
   ========================================================= */

searchInput.addEventListener(
    "input",
    handleSearch
);


function handleSearch() {

    const query =
        searchInput.value
            .trim()
            .toLowerCase();


    /*
       Si la recherche est vide,
       on remet toutes les cases visibles.
    */

    if (query === "") {

        showAllElements();

        return;
    }


    /*
       On sélectionne toutes les cases du tableau.
    */

    const cells =
        document.querySelectorAll(
            ".periodic-table .element"
        );


    cells.forEach(cell => {

        /*
           On récupère le numéro atomique
           stocké dans le texte de la case.

           Une recherche plus propre sera faite
           directement dans elements.
        */

        const atomicNumber =
            cell.querySelector(
                ".atomic-number"
            )?.textContent
            .trim()
            .toLowerCase();


        const symbol =
            cell.querySelector(
                ".symbol"
            )?.textContent
            .trim()
            .toLowerCase();


        const name =
            cell.querySelector(
                ".name"
            )?.textContent
            .trim()
            .toLowerCase();


        const matches =
            name.includes(query) ||
            symbol.includes(query) ||
            atomicNumber === query;


        /*
           On cache les éléments qui ne correspondent pas.
        */

        cell.style.opacity =
            matches ? "1" : "0.15";

        cell.style.filter =
            matches ? "none" : "grayscale(1)";
    });
}


/* =========================================================
   13. RÉAFFICHER TOUS LES ÉLÉMENTS
   ========================================================= */

function showAllElements() {

    const cells =
        document.querySelectorAll(
            ".periodic-table .element"
        );


    cells.forEach(cell => {

        cell.style.opacity = "1";

        cell.style.filter = "none";
    });
}


/* =========================================================
   14. DÉMARRAGE D'ATOMIA
   ========================================================= */

/*
   Tout commence ici.

   Quand le fichier JavaScript est chargé,
   on lance le chargement des données.
*/

loadData();
