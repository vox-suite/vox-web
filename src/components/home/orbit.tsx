import Image from "next/image";

const channels = [
  {
    image: "dithered-receiver-cutout",
    name: "Call",
    title: "Help is a phone call away.",
    text: "Ask a question or set a reminder out loud. No app or mobile data needed.",
  },
  {
    image: "dithered-plane-cutout",
    name: "Message",
    title: "A quick question. A reply to keep.",
    text: "Reach Vox on WhatsApp or Telegram and return to the conversation when you’re ready.",
  },
  {
    image: "dithered-desktop-transparent",
    name: "Desktop",
    title: "Room for the bigger picture.",
    text: "Explore your timeline, compare charts, check sources and work through plans.",
  },
  {
    image: "dithered-mobile-transparent",
    name: "Mobile",
    title: "Your day, within reach.",
    text: "Check your timeline and ask Vox while you’re out.",
  },
];

export function Orbit() {
  return (
    <div className="h-channel-index">
      <ul aria-label="How each Vox interface helps">
        {channels.map(({ image, name, title, text }) => (
          <li key={name}>
            <div className="h-channel-label">
              <span className="h-channel-art-slot" data-channel={name}>
                <Image
                  className="h-channel-art"
                  src={`/illustrations/${image}.png`}
                  alt=""
                  width={56}
                  height={56}
                  sizes="56px"
                  aria-hidden="true"
                />
              </span>
              <span>{name}</span>
            </div>
            <div className="h-channel-description">
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="h-channel-note">
        Same context. Same permissions. <span>Same Vox.</span>
      </p>
    </div>
  );
}
