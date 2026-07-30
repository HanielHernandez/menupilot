import type { MenuBlock } from "@/lib/site-template";

type MenuBlockProps = {
  block: MenuBlock;
  primaryColor: string;
  foregroundColor: string;
  secondaryColor: string;
};

const SAMPLE_ITEMS = [
  { name: "House salad", price: 12, description: "Seasonal greens, citrus vinaigrette" },
  { name: "Wood-fired flatbread", price: 16, description: "Tomato, herbs, soft cheese" },
  { name: "Catch of the day", price: 28, description: "Ask your server for today’s plate" },
];

export default function MenuBlockView({
  block,
  primaryColor,
  foregroundColor,
  secondaryColor,
}: MenuBlockProps) {
  return (
    <section
      id="menu"
      className="flex flex-col gap-6 px-6 py-10"
      style={{ color: foregroundColor }}
    >
      <div className="flex flex-col gap-2">
        <p
          className="text-xs font-semibold tracking-[0.2em] uppercase"
          style={{ color: primaryColor }}
        >
          Menu
        </p>
        <h2 className="text-2xl font-bold tracking-tight">{block.title}</h2>
        <p className="text-sm opacity-85">{block.description}</p>
      </div>
      <ul className="flex flex-col gap-4">
        {SAMPLE_ITEMS.map((item) => (
          <li
            key={item.name}
            className="flex items-start justify-between gap-4 border-b pb-4"
            style={{ borderColor: `${secondaryColor}66` }}
          >
            <div className="min-w-0">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm opacity-75">{item.description}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold" style={{ color: primaryColor }}>
              ${item.price.toFixed(2)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
