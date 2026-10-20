
import { useEffect, useState } from "react";
import "./App.css";

const API_URL_FR =
  "https://fortnite-api.com/v2/cosmetics/br?language=fr";
const API_URL_EN =
  "https://fortnite-api.com/v2/cosmetics/br?language=en";

const categories = [
  "Tout",
  "Tenues",
  "Pioches",
  "Planeurs",
  "Emotes",
  "Accessoires de dos",
  "Enveloppements",
  "Autres",
];

function normalizeText(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getCategory(item) {
  const type = normalizeText(
    `${item.type?.value || ""} ${item.type?.displayValue || ""}`
  ).replace(/[^a-z0-9]/g, "");

  if (type.includes("outfit") || type.includes("tenue")) {
    return "Tenues";
  }

  if (type.includes("pickaxe") || type.includes("pioche")) {
    return "Pioches";
  }

  if (type.includes("glider") || type.includes("planeur")) {
    return "Planeurs";
  }

  if (type.includes("emote")) {
    return "Emotes";
  }

  if (
    type.includes("backbling") ||
    type.includes("backpack") ||
    type.includes("accessoirededos")
  ) {
    return "Accessoires de dos";
  }

  if (type.includes("wrap") || type.includes("enveloppement")) {
    return "Enveloppements";
  }

  return "Autres";
}

async function fetchCosmetics() {
  const [responseFr, responseEn] = await Promise.all([
    fetch(API_URL_FR),
    fetch(API_URL_EN),
  ]);

  if (!responseFr.ok || !responseEn.ok) {
    throw new Error("Le catalogue est temporairement indisponible.");
  }

  const [resultFr, resultEn] = await Promise.all([
    responseFr.json(),
    responseEn.json(),
  ]);

  if (!Array.isArray(resultFr.data) || !Array.isArray(resultEn.data)) {
    throw new Error("La réponse du catalogue est invalide.");
  }

  const englishNames = new Map(
    resultEn.data.map((item) => [item.id, item.name])
  );

  return resultFr.data
    .filter((item) => item.name)
    .map((item) => ({
      ...item,
      nameFr: item.name,
      nameEn: englishNames.get(item.id) || item.name,
    }))
    .sort((a, b) => a.nameFr.localeCompare(b.nameFr, "fr"));
}

function synchronizeLocker(locker, cosmetics) {
  const cosmeticsById = new Map(
    cosmetics.map((item) => [item.id, item])
  );

  return locker.map((owned) => {
    const item = cosmeticsById.get(owned.id);

    if (!item) {
      return owned;
    }

    return {
      ...owned,
      nameFr: item.nameFr || owned.nameFr,
      nameEn: item.nameEn || owned.nameEn,
      image:
        item.images?.icon ||
        item.images?.smallIcon ||
        item.images?.featured ||
        owned.image ||
        "",
      category: getCategory(item),
      rarity:
        item.rarity?.value ||
        item.rarity?.displayValue ||
        "Inconnue",
      series:
        item.series?.value ||
        item.series?.displayValue ||
        "",
    };
  });
}

function App() {
  const [cosmetics, setCosmetics] = useState([]);

  // Casier personnel : une seule déclaration
  const [locker, setLocker] = useState(() => {
    try {
      const saved = localStorage.getItem("lockr-locker");

      if (!saved) return [];

      const parsed = JSON.parse(saved);

      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [category, setCategory] = useState("Tout");
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("Tout");
  const [seriesFilter, setSeriesFilter] = useState("Tout");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Chargement du catalogue Fortnite
  function loadCosmetics() {
    fetchCosmetics()
      .then((catalog) => {
        setCosmetics(catalog);
        if (catalog.length > 0) {
          setLocker((current) => synchronizeLocker(current, catalog));
        }
      })
      .catch((err) =>
        setError(
          err.message ||
            "Impossible de charger le catalogue. Vérifie ta connexion."
        )
      )
      .finally(() => setLoading(false));
  }

  function refreshCosmetics() {
    setLoading(true);
    setError("");
    loadCosmetics();
  }

  // Charger le catalogue au démarrage
  useEffect(() => {
    loadCosmetics();
  }, []);

  // Sauvegarder automatiquement le casier
  useEffect(() => {
    try {
      localStorage.setItem(
        "lockr-locker",
        JSON.stringify(locker)
      );
    } catch {
      console.warn("La sauvegarde du casier a échoué.");
    }
  }, [locker]);

  // Ajouter ou retirer un cosmétique du casier
  function toggleLocker(item) {
    setLocker((current) => {
      const alreadyOwned = current.some(
        (owned) => owned.id === item.id
      );

      if (alreadyOwned) {
        return current.filter(
          (owned) => owned.id !== item.id
        );
      }

      return [
        ...current,
        {
          id: item.id,
          nameFr: item.nameFr,
          nameEn: item.nameEn,
          image:
            item.images?.icon ||
            item.images?.smallIcon ||
            item.images?.featured ||
            "",
          category: getCategory(item),
          rarity:
            item.rarity?.value ||
            item.rarity?.displayValue ||
            "Inconnue",
          series:
            item.series?.value ||
            item.series?.displayValue ||
            "",
        },
      ];
    });
  }

  const rarityOptions = [
    ...new Map(
      cosmetics
        .filter((item) => item.rarity?.value || item.rarity?.displayValue)
        .map((item) => {
          const value =
            item.rarity?.value || item.rarity?.displayValue;

          return [
            normalizeText(value),
            {
              value,
              label:
                item.rarity?.displayValue ||
                item.rarity?.value,
            },
          ];
        })
    ).values(),
  ].sort((a, b) => a.label.localeCompare(b.label, "fr"));

  const seriesOptions = [
    ...new Map(
      cosmetics
        .filter((item) => item.series?.value || item.series?.displayValue)
        .map((item) => {
          const value =
            item.series?.value || item.series?.displayValue;

          return [
            normalizeText(value),
            {
              value,
              label:
                item.series?.displayValue ||
                item.series?.value,
            },
          ];
        })
    ).values(),
  ].sort((a, b) => a.label.localeCompare(b.label, "fr"));

  // Recherche et filtres
  const filtered = cosmetics
    .filter((item) => {
      const matchesCategory =
        category === "Tout" ||
        getCategory(item) === category;

      const query = normalizeText(search);

      const searchableText = normalizeText(
        [
          item.nameFr,
          item.nameEn,
          item.id,
          item.description?.text,
        ].join(" ")
      );

      const rarity =
        item.rarity?.value ||
        item.rarity?.displayValue ||
        "";

      const series =
        item.series?.value ||
        item.series?.displayValue ||
        "";

      const matchesRarity =
        rarityFilter === "Tout" ||
        normalizeText(rarity) === normalizeText(rarityFilter);

      const matchesSeries =
        seriesFilter === "Tout" ||
        normalizeText(series) === normalizeText(seriesFilter);

      return (
        matchesCategory &&
        searchableText.includes(query) &&
        matchesRarity &&
        matchesSeries
      );
    })
    .sort((a, b) => {
      if (sortOrder === "name-desc") {
        return b.nameFr.localeCompare(a.nameFr, "fr");
      }

      if (sortOrder === "rarity-desc") {
        const ranks = {
          common: 1,
          uncommon: 2,
          rare: 3,
          epic: 4,
          legendary: 5,
          mythic: 6,
        };

        const rankA =
          ranks[normalizeText(a.rarity?.value)] || 0;
        const rankB =
          ranks[normalizeText(b.rarity?.value)] || 0;

        return rankB - rankA ||
          a.nameFr.localeCompare(b.nameFr, "fr");
      }

      return a.nameFr.localeCompare(b.nameFr, "fr");
    });

  const outfitCount = cosmetics.filter(
    (item) => getCategory(item) === "Tenues"
  ).length;

  const ownedCount = locker.length;

  const ownedOutfits = locker.filter(
    (item) => item.category === "Tenues"
  ).length;

  const ownedPickaxes = locker.filter(
    (item) => item.category === "Pioches"
  ).length;

  const ownedEmotes = locker.filter(
    (item) => item.category === "Emotes"
  ).length;

  const ownedGliders = locker.filter(
    (item) => item.category === "Planeurs"
  ).length;

  const rarityGroups = [
    { label: "Commune", values: ["common", "commune"] },
    { label: "Atypique", values: ["uncommon", "atypique"] },
    { label: "Rare", values: ["rare"] },
    { label: "Épique", values: ["epic", "epique"] },
    { label: "Légendaire", values: ["legendary", "legendaire"] },
    { label: "Mythique", values: ["mythic", "mythique"] },
  ];

  const rarityCounts = rarityGroups.map((group) => ({
    label: group.label,
    count: locker.filter((item) => {
      const rarity = normalizeText(item.rarity).replace(/[^a-z]/g, "");
      return group.values.some(
        (value) => rarity === value.replace(/[^a-z]/g, "")
      );
    }).length,
  }));

  const specialSeriesCount = locker.filter(
    (item) => Boolean(item.series)
  ).length;

  const rarityScores = {
    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
    mythic: 6,

    marvel: 5,
    marvelseries: 5,
    icon: 5,
    iconseries: 5,
    gaminglegends: 5,
    gaminglegendsseries: 5,
    dark: 5,
    darkseries: 5,
    dc: 5,
    dcuseries: 5,
    frozen: 5,
    frozenseries: 5,
    lava: 5,
    lavaseries: 5,
    shadow: 5,
    shadowseries: 5,
    slurp: 5,
    slurpseries: 5,
    starwars: 5,
    starwarsseries: 5,
  };

  const collectionScore = locker.reduce((total, item) => {
    const rarity = normalizeText(item.rarity).replace(/[^a-z]/g, "");
    return total + (rarityScores[rarity] || 1);
  }, 0);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">L</div>
          <div>
            <strong>LOCKR</strong>
            <span>FORTNITE TRACKER</span>
          </div>
        </div>

        <div className="nav-label">ESPACE PERSONNEL</div>

        <button
          className="nav-item active"
          onClick={() =>
            document.getElementById("catalogue")?.scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          ▦ <span>Catalogue</span>
        </button>

        <button
          className="nav-item"
          onClick={() =>
            document.getElementById("mon-casier")?.scrollIntoView({
              behavior: "smooth",
            })
          }
        >
          ◈ <span>Mon casier ({ownedCount})</span>
        </button>

        <div className="sidebar-bottom">
          <div className="connection-dot" />
          <div>
            <strong>
              {loading
                ? "Chargement..."
                : error
                  ? "Erreur de connexion"
                  : "Catalogue connecté"}
            </strong>
            <span>Données publiques</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            LOCKR <span>/</span> Catalogue
          </div>

          <div className="demo-badge">
            <span /> CATALOGUE PUBLIC
          </div>
        </header>

        <section className="welcome">
          <div>
            <div className="eyebrow">
              FORTNITE LOCKER INTELLIGENCE
            </div>

            <h1>
              Ta collection.
              <br />
              <span>À la loupe.</span>
            </h1>

            <p>
              Explore les cosmétiques Fortnite, recherche des objets
              et construis ta collection personnelle.
            </p>

            <button
              className="primary-button"
              onClick={refreshCosmetics}
              disabled={loading}
            >
              {loading
                ? "Chargement..."
                : "Actualiser le catalogue"}{" "}
              <span>↻</span>
            </button>
          </div>

          <div className="hero-graphic">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-symbol">L</div>
            <div className="graphic-caption">
              COSMETIC DATABASE <span>LIVE</span>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          <article className="stat-card">
            <div className="stat-top">
              <span>COSMÉTIQUES AU CATALOGUE</span>
              <span className="stat-icon">◈</span>
            </div>

            <div className="stat-value">
              {loading
                ? "..."
                : cosmetics.length.toLocaleString("fr-BE")}
            </div>

            <div className="stat-note">
              Objets répertoriés par la source
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>TENUES</span>
              <span className="stat-icon">◇</span>
            </div>

            <div className="stat-value">
              {loading
                ? "..."
                : outfitCount.toLocaleString("fr-BE")}
            </div>

            <div className="stat-note">
              Tenues répertoriées
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>MON CASIER</span>
              <span className="stat-icon">⌕</span>
            </div>

            <div className="stat-value">
              {ownedCount.toLocaleString("fr-BE")}
            </div>

            <div className="stat-note">
              Cosmétiques ajoutés manuellement
            </div>
          </article>

          <article className="stat-card highlight-card">
            <div className="stat-top">
              <span>INDICE DE COLLECTION</span>
              <span className="stat-icon">◈</span>
            </div>

            <div className="stat-value">
              {collectionScore.toLocaleString("fr-BE")} pts
            </div>

            <div className="stat-note">
              Indice de collection basé sur la rareté
            </div>
          </article>
        </section>

        <section className="stats-grid collection-stats">
          <article className="stat-card">
            <div className="stat-top">
              <span>TENUES POSSÉDÉES</span>
              <span className="stat-icon">◇</span>
            </div>
            <div className="stat-value">{ownedOutfits}</div>
            <div className="stat-note">Tenues dans ton casier</div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>Pioches</span>
              <span className="stat-icon">⚒</span>
            </div>
            <div className="stat-value">{ownedPickaxes}</div>
            <div className="stat-note">Pioches dans ton casier</div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>EMOTES</span>
              <span className="stat-icon">♪</span>
            </div>
            <div className="stat-value">{ownedEmotes}</div>
            <div className="stat-note">Emotes dans ton casier</div>
          </article>

          <article className="stat-card">
            <div className="stat-top">
              <span>PLANEURS</span>
              <span className="stat-icon">✧</span>
            </div>
            <div className="stat-value">{ownedGliders}</div>
            <div className="stat-note">Planeurs dans ton casier</div>
          </article>
        </section>

        <section className="locker-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">ANALYSE DE COLLECTION</div>
              <h2>Répartition par rareté</h2>
            </div>
          </div>

          <div className="stats-grid">
            {rarityCounts.map((group) => {
              const percentage =
                ownedCount > 0
                  ? Math.round((group.count / ownedCount) * 100)
                  : 0;

              return (
                <article className="stat-card" key={group.label}>
                  <div className="stat-top">
                    <span>{group.label.toUpperCase()}</span>
                    <span className="stat-icon">◈</span>
                  </div>

                  <div className="stat-value">{group.count}</div>

                  <div className="stat-note">
                    {percentage}% de ton casier
                  </div>
                </article>
              );
            })}

            <article className="stat-card">
              <div className="stat-top">
                <span>SÉRIES SPÉCIALES</span>
                <span className="stat-icon">◈</span>
              </div>

              <div className="stat-value">{specialSeriesCount}</div>

              <div className="stat-note">
                Cosmétiques issus d'une série spéciale
              </div>
            </article>
          </div>
        </section>

        <section className="locker-section" id="catalogue">
          <div className="section-heading">
            <div>
              <div className="eyebrow">BASE DE DONNÉES</div>
              <h2>Catalogue des cosmétiques</h2>
            </div>

            <span className="item-count">
              {loading
                ? "Chargement des données..."
                : `${filtered.length} résultat(s)`}
            </span>
          </div>

          <input
            className="catalog-search"
            type="search"
            placeholder="Rechercher un skin, une pioche, un emote..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="filters">
            <select
              value={rarityFilter}
              onChange={(event) => setRarityFilter(event.target.value)}
              aria-label="Filtrer par rareté"
            >
              <option value="Tout">Toutes les raretés</option>
              {rarityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={seriesFilter}
              onChange={(event) => setSeriesFilter(event.target.value)}
              aria-label="Filtrer par série"
            >
              <option value="Tout">Toutes les séries</option>
              {seriesOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              aria-label="Trier les cosmétiques"
            >
              <option value="name-asc">Nom : A à Z</option>
              <option value="name-desc">Nom : Z à A</option>
              <option value="rarity-desc">Rareté : plus élevée d'abord</option>
            </select>
          </div>

          <div className="filters">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={
                  category === item
                    ? "filter active-filter"
                    : "filter"
                }
              >
                {item}
              </button>
            ))}
          </div>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <button
                className="filter"
                onClick={refreshCosmetics}
              >
                Réessayer
              </button>
            </div>
          )}

          {loading && (
            <p className="status-message">
              Récupération du catalogue...
            </p>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="status-message">
              Aucun cosmétique ne correspond à ta recherche.
            </p>
          )}

          <div className="cosmetic-grid">
            {filtered.slice(0, 80).map((item) => {
              const image =
                item.images?.icon ||
                item.images?.smallIcon ||
                item.images?.featured;

              const rarity =
                item.rarity?.displayValue ||
                item.rarity?.value ||
                "Rareté inconnue";

              const isOwned = locker.some(
                (owned) => owned.id === item.id
              );

              return (
                <article
                  className="cosmetic-card"
                  key={item.id}
                >
                  <div className="cosmetic-art">
                    {image ? (
                      <img
                        src={image}
                        alt={item.nameFr || item.nameEn}
                        loading="lazy"
                      />
                    ) : (
                      <div className="art-initial">
                        {(item.nameFr || item.nameEn || "?").charAt(0)}
                      </div>
                    )}

                    <span className="rarity">{rarity}</span>
                  </div>

                  <div className="cosmetic-info">
                    <span className="cosmetic-type">
                      {getCategory(item)}
                    </span>

                    <strong>
                      {item.nameFr || item.nameEn}
                    </strong>

                    <button
                      className={
                        isOwned
                          ? "filter active-filter"
                          : "filter"
                      }
                      onClick={() => toggleLocker(item)}
                    >
                      {isOwned
                        ? "✓ Dans mon casier"
                        : "+ Ajouter au casier"}
                    </button>

                    <div className="item-score">
                      <span>
                        {item.set?.text || "Objet Fortnite"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {!loading && filtered.length > 80 && (
            <p className="disclaimer">
              Affichage limité aux 80 premiers résultats.
              Affine ta recherche pour retrouver un objet précis.
            </p>
          )}

          <p className="disclaimer">
            Catalogue communautaire : les objets listés ne sont pas
            nécessairement possédés par ton compte. L'ajout au casier
            est manuel et aucune valeur marchande n'est calculée.
          </p>
        </section>

        <section className="locker-section" id="mon-casier">
          <div className="section-heading">
            <div>
              <div className="eyebrow">ESPACE PERSONNEL</div>
              <h2>Mon casier</h2>
            </div>

            <span className="item-count">
              {ownedCount} objet(s)
            </span>
          </div>

          {ownedCount === 0 ? (
            <p className="status-message">
              Ton casier est vide. Ajoute des cosmétiques depuis
              le catalogue pour commencer ta collection.
            </p>
          ) : (
            <div className="cosmetic-grid">
              {locker.map((item) => (
                <article
                  className="cosmetic-card"
                  key={item.id}
                >
                  <div className="cosmetic-art">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.nameFr || item.nameEn}
                        loading="lazy"
                      />
                    ) : (
                      <div className="art-initial">
                        {(item.nameFr || item.nameEn || "?").charAt(0)}
                      </div>
                    )}

                    <span className="rarity">
                      {item.rarity}
                    </span>
                  </div>

                  <div className="cosmetic-info">
                    <span className="cosmetic-type">
                      {item.category}
                    </span>

                    <strong>
                      {item.nameFr || item.nameEn}
                    </strong>

                    <button
                      className="filter"
                      onClick={() => toggleLocker(item)}
                    >
                      − Retirer du casier
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer>
          <span>LOCKR © 2026</span>
          <span>
            Projet indépendant · Non affilié à Epic Games
          </span>
        </footer>
      </main>
    </div>
  );
}

export default App;
