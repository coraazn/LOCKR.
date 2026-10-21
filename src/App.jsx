
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import "./App.css";

const API_URL_FR =
  "https://fortnite-api.com/v2/cosmetics/br?language=fr";
const API_URL_EN =
  "https://fortnite-api.com/v2/cosmetics/br?language=en";
const PAGE_SIZE = 40;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
let supabase = null;
let supabaseConfigError = "";

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    supabaseConfigError = err instanceof Error
      ? `Configuration Supabase invalide : ${err.message}`
      : "Configuration Supabase invalide.";
  }
} else if (supabaseUrl || supabaseKey) {
  supabaseConfigError =
    "Les deux variables VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY sont nécessaires.";
}

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

const countries = [
  ["BE", "Belgique"],
  ["FR", "France"],
  ["CH", "Suisse"],
  ["CA", "Canada"],
  ["LU", "Luxembourg"],
  ["DE", "Allemagne"],
  ["NL", "Pays-Bas"],
  ["GB", "Royaume-Uni"],
  ["ES", "Espagne"],
  ["IT", "Italie"],
  ["PT", "Portugal"],
  ["PL", "Pologne"],
  ["US", "États-Unis"],
  ["BR", "Brésil"],
  ["OTHER", "Autre pays"],
];

const europeanCountries = new Set([
  "BE", "FR", "CH", "LU", "DE", "NL", "GB", "ES", "IT", "PT",
  "PL", "AT", "DK", "SE", "NO", "FI", "IE", "GR", "CZ", "SK",
  "HU", "RO", "BG", "HR", "SI", "EE", "LV", "LT", "CY", "MT",
  "IS", "UA", "RS", "AL", "BA", "ME", "MK", "MD", "XK",
]);

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

function getRarityPoints(rarity) {
  const value = normalizeText(rarity).replace(/[^a-z]/g, "");
  const points = {
    common: 1,
    commune: 1,
    uncommon: 2,
    atypique: 2,
    rare: 3,
    epic: 4,
    epique: 4,
    legendary: 5,
    legendaire: 5,
    mythic: 6,
    mythique: 6,
    exotic: 5,
    exotique: 5,
  };

  return points[value] || 1;
}

function getItemScore(item) {
  const rarity = item.rarity?.value || item.rarity?.displayValue || item.rarity;
  const hasSeries = Boolean(
    item.series?.value || item.series?.displayValue || item.series
  );

  return getRarityPoints(rarity) + (hasSeries ? 2 : 0);
}

function getGrade(score) {
  if (score >= 500) return { name: "S", label: "Mythique", color: "#c6a6ff" };
  if (score >= 250) return { name: "A", label: "Légendaire", color: "#ffca75" };
  if (score >= 100) return { name: "B", label: "Épique", color: "#d4a1ff" };
  if (score >= 30) return { name: "C", label: "Rare", color: "#78b9ff" };
  return { name: "D", label: "Débutant", color: "#b6fa6b" };
}

function getOwnedItem(item) {
  return {
    id: item.id,
    nameFr: item.nameFr,
    nameEn: item.nameEn,
    image: item.images?.icon || item.images?.smallIcon || item.images?.featured || "",
    category: getCategory(item),
    rarity: item.rarity?.value || item.rarity?.displayValue || "Inconnue",
    series: item.series?.value || item.series?.displayValue || "",
  };
}

function readLocalArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

async function fetchAllRows(queryForRange) {
  const rows = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await queryForRange(from, from + pageSize - 1);
    if (error) throw error;
    rows.push(...data);
    if (data.length < pageSize) return rows;
  }
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
  const [locker, setLocker] = useState(() => readLocalArray("lockr-locker"));
  const [favorites, setFavorites] = useState(() => readLocalArray("lockr-favorites"));

  const [category, setCategory] = useState("Tout");
  const [search, setSearch] = useState("");
  const [rarityFilter, setRarityFilter] = useState("Tout");
  const [seriesFilter, setSeriesFilter] = useState("Tout");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [cloudReadyUserId, setCloudReadyUserId] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [countryCode, setCountryCode] = useState("BE");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [leaderboardScope, setLeaderboardScope] = useState("world");
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadCosmetics() {
    setLoading(true);
    setError("");

    try {
      const catalog = await fetchCosmetics();
      setCosmetics(catalog);
      setLocker((current) => synchronizeLocker(current, catalog));
    } catch (err) {
      setError(err instanceof Error
        ? err.message
        : "Impossible de charger le catalogue. Vérifie ta connexion.");
    } finally {
      setLoading(false);
    }
  }

  function refreshCosmetics() {
    loadCosmetics();
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => loadCosmetics(), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lockr-locker", JSON.stringify(locker));
    } catch {
      window.setTimeout(() => setNotice("La sauvegarde locale du casier a échoué."), 0);
    }
  }, [locker]);

  useEffect(() => {
    try {
      localStorage.setItem("lockr-favorites", JSON.stringify(favorites));
    } catch {
      window.setTimeout(() => setNotice("La sauvegarde locale des favoris a échoué."), 0);
    }
  }, [favorites]);

  useEffect(() => {
    if (!supabase) return undefined;

    let active = true;
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (active) setUser(session?.user || null);
      }
    );

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setAuthMessage(sessionError.message);
      setUser(data.session?.user || null);
    }).catch((err) => {
      if (active) {
        setAuthMessage(err instanceof Error
          ? `Impossible de vérifier la session : ${err.message}`
          : "Impossible de vérifier la session.");
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!user || !supabase || cosmetics.length === 0) {
        setCloudReadyUserId(null);
        setProfile(null);
        return;
      }

      setCloudReadyUserId(null);
      setProfile(null);
      setAuthMessage("");

      async function loadAccountData() {
        const [profileResult, lockerResult] = await Promise.all([
          supabase.from("profiles")
            .select("id, username, country_code")
            .eq("id", user.id)
            .maybeSingle(),
          supabase.from("lockers")
            .select("item_ids")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

        if (cancelled) return;

        if (profileResult.error) {
          setAuthMessage(`Impossible de charger le profil : ${profileResult.error.message}`);
        } else {
          setProfile(profileResult.data);
          if (!profileResult.data) {
            setAuthMessage("Le profil est introuvable. Vérifie le déclencheur SQL Supabase.");
          }
        }

        if (lockerResult.error) {
          setAuthMessage(`Impossible de charger le casier : ${lockerResult.error.message}`);
          return;
        }

        if (lockerResult.data) {
          const ids = Array.isArray(lockerResult.data.item_ids)
            ? [...new Set(lockerResult.data.item_ids.filter((id) => typeof id === "string"))]
            : [];
          const byId = new Map(cosmetics.map((item) => [item.id, item]));
          setLocker(ids.map((id) => {
            const item = byId.get(id);
            return item ? getOwnedItem(item) : {
              id,
              nameFr: "Objet indisponible",
              nameEn: "Unavailable item",
              image: "",
              category: "Autres",
              rarity: "Inconnue",
              series: "",
            };
          }));
        }

        setCloudReadyUserId(user.id);
      }

      loadAccountData().catch((err) => {
        if (!cancelled) {
          setAuthMessage(err instanceof Error
            ? `Impossible de charger les données du compte : ${err.message}`
            : "Impossible de charger les données du compte.");
        }
      });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [user, cosmetics]);

  function toggleLocker(item) {
    setLocker((current) => {
      return current.some((owned) => owned.id === item.id)
        ? current.filter((owned) => owned.id !== item.id)
        : [...current, getOwnedItem(item)];
    });
  }

  function toggleFavorite(id) {
    setFavorites((current) => current.includes(id)
      ? current.filter((value) => value !== id)
      : [...current, id]);
  }

  const cosmeticsById = useMemo(
    () => new Map(cosmetics.map((item) => [item.id, item])),
    [cosmetics]
  );
  const ownedIds = useMemo(
    () => new Set(locker.map((item) => item.id)),
    [locker]
  );
  const collectionScore = useMemo(
    () => locker.reduce((total, item) => total + getItemScore(item), 0),
    [locker]
  );
  const grade = getGrade(collectionScore);

  const rarityOptions = useMemo(() => {
    const options = new Map();
    cosmetics.forEach((item) => {
      const value = item.rarity?.value || item.rarity?.displayValue;
      if (value) {
        options.set(normalizeText(value), {
          value,
          label: item.rarity?.displayValue || value,
        });
      }
    });
    return [...options.values()].sort((a, b) => a.label.localeCompare(b.label, "fr"));
  }, [cosmetics]);

  const seriesOptions = useMemo(() => {
    const options = new Map();
    cosmetics.forEach((item) => {
      const value = item.series?.value || item.series?.displayValue;
      if (value) {
        options.set(normalizeText(value), {
          value,
          label: item.series?.displayValue || value,
        });
      }
    });
    return [...options.values()].sort((a, b) => a.label.localeCompare(b.label, "fr"));
  }, [cosmetics]);

  const filtered = useMemo(() => cosmetics
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
        matchesSeries &&
        (!favoritesOnly || favorites.includes(item.id))
      );
    })
    .sort((a, b) => {
      if (sortOrder === "name-desc") return b.nameFr.localeCompare(a.nameFr, "fr");
      if (sortOrder === "rarity-desc") {
        return getItemScore(b) - getItemScore(a) ||
          a.nameFr.localeCompare(b.nameFr, "fr");
      }
      return a.nameFr.localeCompare(b.nameFr, "fr");
    }), [
      cosmetics,
      category,
      search,
      rarityFilter,
      seriesFilter,
      favoritesOnly,
      favorites,
      sortOrder,
    ]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activePage = Math.min(page, pageCount);
  const pageItems = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

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
      return group.values.includes(rarity);
    }).length,
  }));

  const specialSeriesCount = locker.filter(
    (item) => Boolean(item.series)
  ).length;

  const loadLeaderboard = useCallback(async () => {
    if (!supabase) {
      setLeaderboardError(supabaseConfigError || "Configure Supabase pour activer les classements partagés.");
      return;
    }

    setLeaderboardLoading(true);
    setLeaderboardError("");

    try {
      const [profiles, lockers] = await Promise.all([
        fetchAllRows((from, to) => supabase
          .from("profiles")
          .select("id, username, country_code, created_at")
          .range(from, to)),
        fetchAllRows((from, to) => supabase
          .from("lockers")
          .select("user_id, item_ids")
          .range(from, to)),
      ]);

      const lockersByUser = new Map(lockers.map((row) => [
        row.user_id,
        Array.isArray(row.item_ids)
          ? [...new Set(row.item_ids.filter((id) => typeof id === "string"))]
          : [],
      ]));

      const rows = profiles.map((person) => {
        const ids = lockersByUser.get(person.id) || [];
        const score = ids.reduce((total, id) => {
          const item = cosmeticsById.get(id);
          return total + (item ? getItemScore(item) : 0);
        }, 0);
        return { ...person, count: ids.length, score, grade: getGrade(score) };
      });

      const scoped = rows.filter((person) => {
        if (leaderboardScope === "europe") {
          return europeanCountries.has(person.country_code);
        }
        if (leaderboardScope === "country") {
          return person.country_code === (profile?.country_code || countryCode);
        }
        return true;
      });

      scoped.sort((a, b) => b.score - a.score || b.count - a.count);
      setLeaderboard(scoped.slice(0, 50));
    } catch (err) {
      setLeaderboardError(err instanceof Error
        ? `Impossible de charger le classement : ${err.message}`
        : "Impossible de charger le classement.");
    } finally {
      setLeaderboardLoading(false);
    }
  }, [cosmeticsById, leaderboardScope, profile?.country_code, countryCode]);

  useEffect(() => {
    if (cosmetics.length === 0 || !supabase) return undefined;
    const timeout = window.setTimeout(() => loadLeaderboard(), 0);
    return () => window.clearTimeout(timeout);
  }, [cosmetics.length, loadLeaderboard]);

  useEffect(() => {
    if (!user || !supabase || cloudReadyUserId !== user.id) return undefined;

    let active = true;
    const timeout = window.setTimeout(async () => {
      try {
        const itemIds = [...new Set(locker.map((item) => item.id))];
        const { error: saveError } = await supabase
          .from("lockers")
          .upsert({
            user_id: user.id,
            item_ids: itemIds,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });

        if (!active) return;
        if (saveError) {
          setNotice(`La synchronisation du casier a échoué : ${saveError.message}`);
        } else {
          setNotice("");
          await loadLeaderboard();
        }
      } catch (err) {
        if (active) {
          setNotice(err instanceof Error
            ? `La synchronisation du casier a échoué : ${err.message}`
            : "La synchronisation du casier a échoué.");
        }
      }
    }, 300);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [locker, user, cloudReadyUserId, loadLeaderboard]);

  async function handleAuth(event) {
    event.preventDefault();
    setAuthMessage("");

    if (!supabase) {
      setAuthMessage(supabaseConfigError || "Configure Supabase dans le fichier .env.local.");
      return;
    }

    setAuthBusy(true);
    try {
      if (authMode === "signup") {
        const cleanUsername = username.trim();
        if (!/^[A-Za-z0-9_]{3,20}$/.test(cleanUsername)) {
          setAuthMessage("Le pseudo doit contenir 3 à 20 lettres, chiffres ou tirets bas.");
          return;
        }
        if (password.length < 6) {
          setAuthMessage("Le mot de passe doit contenir au moins 6 caractères.");
          return;
        }

        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { username: cleanUsername, country_code: countryCode },
          },
        });
        if (signupError) throw signupError;
        if (data.session) {
          setAuthMessage("Compte créé. Ton casier sera synchronisé.");
        } else {
          setAuthMessage("Compte créé. Ouvre le lien reçu par e-mail pour vérifier ton adresse, puis reviens te connecter.");
          setAuthMode("login");
        }
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (loginError) throw loginError;
        setAuthMessage("Connexion réussie.");
      }
    } catch (err) {
      setAuthMessage(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleLogout() {
    if (!supabase) return;
    try {
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) {
        setAuthMessage(logoutError.message);
      } else {
        setAuthMessage("Tu es déconnecté. Ton casier local reste disponible sur cet appareil.");
      }
    } catch (err) {
      setAuthMessage(err instanceof Error ? err.message : "La déconnexion a échoué.");
    }
  }

  async function updateProfile(event) {
    event.preventDefault();
    if (!supabase || !user || !profile) return;

    const cleanUsername = profile.username.trim();
    if (!/^[A-Za-z0-9_]{3,20}$/.test(cleanUsername)) {
      setAuthMessage("Le pseudo doit contenir 3 à 20 lettres, chiffres ou tirets bas.");
      return;
    }

    setAuthBusy(true);
    try {
      const { data, error: updateError } = await supabase
        .from("profiles")
        .update({ username: cleanUsername, country_code: profile.country_code })
        .eq("id", user.id)
        .select("id, username, country_code")
        .single();

      if (updateError) throw updateError;
      setProfile(data);
      setAuthMessage("Profil mis à jour.");
      await loadLeaderboard();
    } catch (err) {
      setAuthMessage(err instanceof Error
        ? `Impossible de mettre à jour le profil : ${err.message}`
        : "Impossible de mettre à jour le profil.");
    } finally {
      setAuthBusy(false);
    }
  }

  const countryName = (code) =>
    countries.find(([value]) => value === code)?.[1] || code || "Non renseigné";
  const myRank = leaderboard.findIndex((entry) => entry.id === user?.id);

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  function CosmeticCard({ item }) {
    const image = item.images?.icon || item.images?.smallIcon || item.images?.featured;
    const rarity = item.rarity?.displayValue || item.rarity?.value || "Rareté inconnue";
    const isOwned = ownedIds.has(item.id);
    const isFavorite = favorites.includes(item.id);

    return (
      <article className="cosmetic-card" key={item.id}>
        <div className="cosmetic-art">
          {image ? (
            <img src={image} alt={item.nameFr || item.nameEn} loading="lazy" />
          ) : (
            <div className="art-initial">
              {(item.nameFr || item.nameEn || "?").charAt(0)}
            </div>
          )}
          <span className="rarity">{rarity}</span>
          <button
            className={isFavorite ? "favorite-button is-favorite" : "favorite-button"}
            onClick={() => toggleFavorite(item.id)}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            {isFavorite ? "♥" : "♡"}
          </button>
        </div>

        <div className="cosmetic-info">
          <span className="cosmetic-type">{getCategory(item)}</span>
          <strong>{item.nameFr || item.nameEn}</strong>
          <div className="item-score">Score LOCKR : <b>{getItemScore(item)} pts</b></div>
          <button
            className={isOwned ? "filter active-filter" : "filter"}
            onClick={() => toggleLocker(item)}
          >
            {isOwned ? "✓ Dans mon casier" : "+ Ajouter au casier"}
          </button>
        </div>
      </article>
    );
  }

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

        <nav className="primary-nav" aria-label="Navigation principale">
          <button className="nav-item" onClick={() => scrollTo("dashboard")}>
            <span className="nav-icon" aria-hidden="true">⌂</span>
            <span>Accueil</span>
          </button>

          <button className="nav-item" onClick={() => scrollTo("catalogue")}>
            <span className="nav-icon" aria-hidden="true">◈</span>
            <span>Catalogue</span>
          </button>

          <button className="nav-item" onClick={() => scrollTo("mon-casier")}>
            <span className="nav-icon" aria-hidden="true">▣</span>
            <span>Casier ({ownedCount})</span>
          </button>

          <button className="nav-item" onClick={() => scrollTo("communaute")}>
            <span className="nav-icon" aria-hidden="true">♙</span>
            <span>Communauté</span>
          </button>

          <button className="nav-item" onClick={() => scrollTo("compte")}>
            <span className="nav-icon" aria-hidden="true">◉</span>
            <span>Compte</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="connection-dot" />
          <div>
            <strong>
              {loading
                ? "Chargement..."
                : error
                  ? "Catalogue indisponible"
                  : "Catalogue connecté"}
            </strong>
            <span>{user ? "Compte connecté" : "Mode local ou invité"}</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand" aria-label="LOCKR">
            <div className="brand-mark">L</div>
            <strong>LOCKR</strong>
          </div>

          <div className="breadcrumb">
            LOCKR <span>/</span> Catalogue
          </div>

          <div className="demo-badge">
            <span /> {user ? "COMPTE CONNECTÉ" : "MODE INVITÉ"}
          </div>

          <button
            className="mobile-account"
            onClick={() => scrollTo("compte")}
            aria-label={user ? "Ouvrir mon compte, connecté" : "Ouvrir mon compte, mode invité"}
          >
            <span aria-hidden="true">◉</span>
            <span>Compte</span>
          </button>
        </header>

        {!supabase && (
          <div className="error-message">
            {supabaseConfigError || (
              <>
                Supabase n'est pas configuré. Le catalogue et le casier local
                restent utilisables, mais les comptes et classements ne sont pas
                actifs. Configure <code>.env.local</code> pour les activer.
              </>
            )}
          </div>
        )}

        {notice && <p className="status-message" role="status">{notice}</p>}

        <section className="welcome" id="dashboard">
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
              Score indicatif basé sur la rareté et les séries
            </div>
          </article>
        </section>

        <section className="stats-grid collection-stats">
          <article className="stat-card">
            <div className="stat-top">
              <span>GRADE DU CASIER</span>
              <span className="stat-icon">✦</span>
            </div>
            <div className="stat-value" style={{ color: grade.color }}>
              {grade.name} · {grade.label}
            </div>
            <div className="stat-note">Grade indicatif de ta collection</div>
          </article>

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
            aria-label="Rechercher un cosmétique"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
          />

          <div className="filters">
            <select
              value={rarityFilter}
              onChange={(event) => {
                setPage(1);
                setRarityFilter(event.target.value);
              }}
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
              onChange={(event) => {
                setPage(1);
                setSeriesFilter(event.target.value);
              }}
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
              onChange={(event) => {
                setPage(1);
                setSortOrder(event.target.value);
              }}
              aria-label="Trier les cosmétiques"
            >
              <option value="name-asc">Nom : A à Z</option>
              <option value="name-desc">Nom : Z à A</option>
              <option value="rarity-desc">Rareté : plus élevée d'abord</option>
            </select>
            <button
              className={favoritesOnly ? "filter active-filter" : "filter"}
              onClick={() => {
                setPage(1);
                setFavoritesOnly((value) => !value);
              }}
              aria-pressed={favoritesOnly}
            >
              {favoritesOnly ? "♥ Favoris uniquement" : `♡ Favoris (${favorites.length})`}
            </button>
          </div>

          <div className="filters category-filters">
            <select
              className="category-select"
              value={category}
              onChange={(event) => {
                setPage(1);
                setCategory(event.target.value);
              }}
              aria-label="Filtrer par catégorie"
            >
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => {
                  setPage(1);
                  setCategory(item);
                }}
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
            {pageItems.map((item) => <CosmeticCard key={item.id} item={item} />)}
          </div>

          {!loading && filtered.length > PAGE_SIZE && (
            <div className="pagination">
              <button
                className="filter"
                disabled={activePage <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                ← Précédent
              </button>
              <span>Page {activePage} / {pageCount}</span>
              <button
                className="filter"
                disabled={activePage >= pageCount}
                onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              >
                Suivant →
              </button>
            </div>
          )}

          <p className="disclaimer">
            LOCKR est un projet indépendant. Le score est un indicateur
            communautaire basé sur la rareté déclarée et la présence d'une série.
            Il ne représente ni un prix de vente ni une estimation officielle
            d'Epic Games. L'ajout au casier est manuel.
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

          <div className="locker-summary">
            <div><span>Score</span><strong>{collectionScore} pts</strong></div>
            <div>
              <span>Grade</span>
              <strong style={{ color: grade.color }}>{grade.name} · {grade.label}</strong>
            </div>
            <div><span>Favoris</span><strong>{favorites.length}</strong></div>
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

                    <div className="item-score">
                      Score LOCKR : <b>{getItemScore(item)} pts</b>
                    </div>

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

        <section className="locker-section" id="compte">
          <div className="section-heading">
            <div>
              <div className="eyebrow">COMPTE LOCKR</div>
              <h2>{user ? "Ton profil" : "Rejoins la communauté"}</h2>
            </div>
          </div>

          {user ? (
            <div className="account-panel">
              <p className="status-message">
                Connecté avec {user.email}. Ton casier est synchronisé dans ton compte.
              </p>
              {profile && (
                <form className="account-form" onSubmit={updateProfile}>
                  <label>
                    Pseudo public
                    <input
                      value={profile.username}
                      minLength={3}
                      maxLength={20}
                      pattern="[A-Za-z0-9_]{3,20}"
                      onChange={(event) => setProfile({ ...profile, username: event.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Pays
                    <select
                      value={profile.country_code}
                      onChange={(event) => setProfile({ ...profile, country_code: event.target.value })}
                    >
                      {countries.map(([code, name]) => <option value={code} key={code}>{name}</option>)}
                    </select>
                  </label>
                  <button className="primary-button" type="submit" disabled={authBusy}>
                    {authBusy ? "Enregistrement..." : "Enregistrer le profil"}
                  </button>
                </form>
              )}
              <button className="filter" onClick={handleLogout}>Se déconnecter</button>
            </div>
          ) : (
            <form className="account-form" onSubmit={handleAuth}>
              <div className="auth-tabs">
                <button
                  type="button"
                  className={authMode === "login" ? "filter active-filter" : "filter"}
                  onClick={() => { setAuthMode("login"); setAuthMessage(""); }}
                >
                  Connexion
                </button>
                <button
                  type="button"
                  className={authMode === "signup" ? "filter active-filter" : "filter"}
                  onClick={() => { setAuthMode("signup"); setAuthMessage(""); }}
                >
                  Créer un compte
                </button>
              </div>

              {authMode === "signup" && (
                <>
                  <p className="status-message">
                    Après l'inscription, ouvre le lien de vérification reçu par e-mail pour activer ton compte, puis reviens ici pour te connecter.
                  </p>
                  <label>
                    Pseudo public
                    <input
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      minLength={3}
                      maxLength={20}
                      pattern="[A-Za-z0-9_]{3,20}"
                      placeholder="Ex. LockrPlayer"
                      required
                    />
                  </label>
                  <label>
                    Pays
                    <select value={countryCode} onChange={(event) => setCountryCode(event.target.value)}>
                      {countries.map(([code, name]) => <option value={code} key={code}>{name}</option>)}
                    </select>
                  </label>
                </>
              )}

              <label>
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Mot de passe
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={6}
                  autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                  required
                />
              </label>
              <button className="primary-button" type="submit" disabled={authBusy}>
                {authBusy ? "Patiente..." : authMode === "signup" ? "Créer mon compte" : "Se connecter"}
              </button>
              {authMessage && <p className="status-message" role="status">{authMessage}</p>}
              <p className="disclaimer">
                Utilise un mot de passe propre à LOCKR. Ne saisis jamais ton mot de passe Epic Games ici.
              </p>
            </form>
          )}
          {user && authMessage && <p className="status-message" role="status">{authMessage}</p>}
        </section>

        <section className="locker-section" id="communaute">
          <div className="section-heading">
            <div>
              <div className="eyebrow">CLASSEMENTS PARTAGÉS</div>
              <h2>Communauté LOCKR</h2>
            </div>
            <button className="filter" onClick={loadLeaderboard} disabled={leaderboardLoading}>
              {leaderboardLoading ? "Chargement..." : "Actualiser"}
            </button>
          </div>

          <div className="filters">
            {[
              ["world", "Monde"],
              ["europe", "Europe"],
              ["country", profile?.country_code ? countryName(profile.country_code) : countryName(countryCode)],
            ].map(([scope, label]) => (
              <button
                key={scope}
                className={leaderboardScope === scope ? "filter active-filter" : "filter"}
                onClick={() => setLeaderboardScope(scope)}
              >
                {label}
              </button>
            ))}
          </div>

          {user && myRank >= 0 && (
            <p className="status-message">Ton rang : #{myRank + 1} parmi les 50 premiers affichés.</p>
          )}
          {!user && ownedCount > 0 && (
            <p className="status-message">
              Ton casier est enregistré uniquement sur cet appareil. Connecte-toi pour le synchroniser et apparaître dans le classement.
            </p>
          )}
          {leaderboardError && <div className="error-message">{leaderboardError}</div>}
          {!leaderboardError && !leaderboardLoading && leaderboard.length === 0 && (
            <p className="status-message">
              {supabase ? "Aucun profil dans ce classement pour le moment." : "Configure Supabase pour activer les classements partagés."}
            </p>
          )}
          {leaderboard.length > 0 && (
            <div className="leaderboard" role="table" aria-label="Classement des collections LOCKR">
              <div className="leaderboard-row leaderboard-header" role="row">
                <span role="columnheader">Rang</span>
                <span role="columnheader">Joueur</span>
                <span role="columnheader">Pays</span>
                <span role="columnheader">Objets</span>
                <span role="columnheader">Score</span>
                <span role="columnheader">Grade</span>
              </div>
              {leaderboard.map((entry, index) => (
                <div className="leaderboard-row" role="row" key={entry.id}>
                  <span className="leaderboard-rank" role="cell" data-label="Rang">#{index + 1}</span>
                  <strong role="cell" data-label="Joueur">{entry.username}</strong>
                  <span role="cell" data-label="Pays">{countryName(entry.country_code)}</span>
                  <span role="cell" data-label="Objets">{entry.count}</span>
                  <span role="cell" data-label="Score">{entry.score} pts</span>
                  <span className="grade-pill" style={{ color: entry.grade.color }} role="cell" data-label="Grade">{entry.grade.name}</span>
                </div>
              ))}
            </div>
          )}
          <p className="disclaimer">
            Les profils et casiers des membres sont publics pour alimenter ces classements.
            Les scores reposent sur les objets déclarés par les joueurs et ne sont pas vérifiés par Epic Games.
          </p>
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
