
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
   4. PTION DES LANTHANIDES / ACTINIDES
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
       Si la 
