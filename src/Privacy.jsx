import './Terms.css'

export default function Privacy() {
  return (
    <main className="terms-page">
      <header className="terms-header">
        <a className="terms-brand" href="/">LOCKR<span>.</span></a>
        <a href="/">Retour au site</a>
      </header>

      <article className="terms-content">
        <p className="terms-eyebrow">LOCKR · DOCUMENT LÉGAL</p>
        <h1>Politique de confidentialité</h1>

        <p>
          Dernière mise à jour : 21 octobre 2026
        </p>

        <p>
          Cette politique explique quelles données peuvent être traitées
          lorsque vous utilisez le site LOCKR et son bot Discord, pourquoi
          elles le sont et comment vous pouvez exercer vos droits.
        </p>

        <h2>1. Responsable et contact</h2>
        <p>
          LOCKR est un projet indépendant consacré au suivi des casiers
          Fortnite et à des fonctionnalités communautaires sur Discord.
          Pour toute question relative à vos données personnelles, vous
          pouvez contacter l'équipe à l'adresse suivante :
          {' '}
          <a href="mailto:LOCKRk1@proton.me">LOCKRk1@proton.me</a>.
        </p>
        <p>
          LOCKR étant un projet indépendant, son responsable légal et ses
          coordonnées doivent être précisés si la loi applicable l'exige.
        </p>

        <h2>2. Données susceptibles d'être collectées</h2>
        <p>Selon les fonctionnalités utilisées, les données suivantes peuvent être traitées :</p>
        <ul>
          <li>
            <strong>Compte du site :</strong> adresse e-mail utilisée pour
            l'authentification, nom d'utilisateur et code pays du profil.
          </li>
          <li>
            <strong>Casier :</strong> identifiants des objets Fortnite
            enregistrés dans votre casier et informations nécessaires à son
            affichage ou au classement.
          </li>
          <li>
            <strong>Préférences locales :</strong> certains éléments,
            comme le casier en mode local et les favoris, peuvent être
            conservés dans le stockage local de votre navigateur.
          </li>
          <li>
            <strong>Commandes Discord :</strong> données nécessaires au
            fonctionnement des commandes utilisées, notamment l'identifiant
            Discord et le nom d'utilisateur lorsque cela est nécessaire.
          </li>
          <li>
            <strong>Suggestions et signalements :</strong> contenu envoyé,
            nom ou identifiant Discord de l'auteur, et informations
            nécessaires au traitement de la demande.
          </li>
          <li>
            <strong>Modération :</strong> informations nécessaires à
            l'exécution des actions de modération demandées par les
            personnes autorisées sur le serveur.
          </li>
          <li>
            <strong>Données techniques :</strong> des journaux techniques
            peuvent être générés par les services d'hébergement pour
            assurer le fonctionnement, la sécurité et le diagnostic.
          </li>
        </ul>

        <h2>3. Authentification et mots de passe</h2>
        <p>
          L'authentification du site utilise Supabase. Les identifiants
          d'authentification sont traités par ce service. LOCKR ne doit
          pas demander votre mot de passe Discord ou votre mot de passe
          Epic Games. Ne communiquez jamais ces mots de passe au bot,
          à l'équipe ou à un autre utilisateur.
        </p>

        <h2>4. Utilisation des données</h2>
        <p>Les données peuvent être utilisées pour :</p>
        <ul>
          <li>créer et gérer les comptes du site ;</li>
          <li>enregistrer et afficher les casiers ;</li>
          <li>calculer et afficher les scores, grades et classements ;</li>
          <li>répondre aux suggestions et signalements ;</li>
          <li>exécuter les commandes du bot et les actions de modération ;</li>
          <li>maintenir la sécurité, détecter les abus et corriger les erreurs.</li>
        </ul>
        <p>
          Les données ne doivent pas être utilisées à des fins sans rapport
          avec ces fonctions, sauf si une autre base légale le permet.
        </p>

        <h2>5. Stockage et visibilité</h2>
        <p>
          Les données de compte et de casier peuvent être stockées dans
          la base de données Supabase. Les règles actuelles de l'application
          permettent la lecture publique de certaines informations de profil
          et de casier. Par conséquent, ne considérez pas votre nom
          d'utilisateur, votre code pays ou le contenu de votre casier
          enregistré en ligne comme confidentiels.
        </p>
        <p>
          Les données conservées dans le stockage local du navigateur
          restent sur l'appareil concerné, sauf si elles sont supprimées
          par l'utilisateur, le navigateur ou le système. Effacer ces
          données peut faire perdre les informations qui n'ont pas été
          enregistrées en ligne.
        </p>
        <p>
          Les suggestions et signalements transmis au bot peuvent être
          publiés dans des salons Discord dédiés et être visibles par
          les personnes disposant des permissions appropriées.
        </p>

        <h2>6. Services tiers</h2>
        <p>Le fonctionnement de LOCKR peut impliquer les services suivants :</p>
        <ul>
          <li>
            <strong>Supabase :</strong> authentification et base de données.
          </li>
          <li>
            <strong>Vercel :</strong> hébergement et déploiement du site.
          </li>
          <li>
            <strong>Discord :</strong> commandes du bot, suggestions,
            signalements et modération du serveur.
          </li>
          <li>
            <strong>API Fortnite tierce :</strong> récupération de données
            relatives aux objets du jeu pour alimenter le catalogue.
          </li>
          <li>
            <strong>Hébergeur du bot :</strong> exécution du bot et éventuels
            journaux techniques liés à son fonctionnement.
          </li>
        </ul>
        <p>
          Ces prestataires peuvent traiter certaines données conformément
          à leurs propres politiques et conditions. Consultez leurs
          documents de confidentialité respectifs pour plus d'informations.
        </p>

        <h2>7. Partage des données</h2>
        <p>
          LOCKR ne vend pas les données personnelles des utilisateurs.
          Certaines données peuvent être accessibles aux autres utilisateurs
          lorsque les fonctionnalités du site les rendent publiques, aux
          membres autorisés des salons Discord concernés ou aux prestataires
          nécessaires au fonctionnement du service. Des données peuvent
          également être communiquées lorsque la loi l'exige.
        </p>

        <h2>8. Durée de conservation</h2>
        <p>
          Les données sont conservées pendant la durée nécessaire au
          fonctionnement des fonctionnalités concernées, à la sécurité
          et au respect des obligations applicables. La durée exacte peut
          dépendre du service utilisé, de ses sauvegardes et de ses règles
          de conservation. Aucun délai fixe de suppression n'est garanti
          par la présente politique.
        </p>

        <h2>9. Sécurité</h2>
        <p>
          Des mesures techniques et organisationnelles raisonnables doivent
          être mises en œuvre pour protéger les données. Toutefois, aucun
          service en ligne ne peut garantir une sécurité absolue.
          N'utilisez pas LOCKR pour stocker des informations sensibles.
        </p>

        <h2>10. Vos droits</h2>
        <p>
          Selon la législation applicable, notamment le RGPD lorsque
          celui-ci s'applique, vous pouvez disposer de droits d'accès,
          de rectification, d'effacement, de limitation, d'opposition et,
          dans certains cas, de portabilité de vos données. Vous pouvez
          également retirer un consentement lorsque le traitement repose
          sur celui-ci.
        </p>
        <p>
          Pour exercer vos droits ou poser une question, écrivez à
          {' '}
          <a href="mailto:LOCKRk1@proton.me">LOCKRk1@proton.me</a>.
          Une vérification raisonnable de votre identité pourra être
          nécessaire. Certains droits peuvent être soumis à des conditions
          ou exceptions prévues par la loi.
        </p>
        <p>
          Si vous résidez en Belgique, vous pouvez également contacter
          l'Autorité de protection des données :
          {' '}
          <a
            href="https://www.autoriteprotectiondonnees.be/"
            target="_blank"
            rel="noreferrer"
          >
            autoriteprotectiondonnees.be
          </a>.
        </p>

        <h2>11. Mineurs</h2>
        <p>
          Les utilisateurs doivent respecter les conditions d'âge
          applicables aux services utilisés, notamment celles de Discord.
          Si vous pensez que des données concernant un mineur ont été
          traitées de manière inappropriée, contactez-nous à l'adresse
          indiquée ci-dessus.
        </p>

        <h2>12. Modifications</h2>
        <p>
          Cette politique peut être mise à jour lorsque les fonctionnalités
          de LOCKR ou les obligations applicables évoluent. La date de
          dernière mise à jour sera modifiée en conséquence.
        </p>

        <h2>13. Contact</h2>
        <p>
          Pour toute question concernant cette politique :
          {' '}
          <a href="mailto:LOCKRk1@proton.me">LOCKRk1@proton.me</a>.
        </p>

        <p>
          Fortnite est une marque d'Epic Games. LOCKR est un projet
          indépendant et n'est ni affilié à Epic Games ni approuvé par
          cette société.
        </p>
      </article>
    </main>
  )
}
