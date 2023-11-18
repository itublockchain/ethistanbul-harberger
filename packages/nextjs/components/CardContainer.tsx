import Card from "./Card";

export default function CardContainer() {
  const domains: string[] = ["oemrfurkan.me", "utkuomer.me", "alieray.me", "oemrfurkan.me", "utkuomer.me", "alieray.me", "oemrfurkan.me", "utkuomer.me", "alieray.me"];
  return (
    <>
      <div className="flex flex-wrap w-full h-screen gap-10">
          {domains.map((domain, index) => (
              <Card domain={domain} key={index} />
          ))}
      </div>
    </>
  );
}
