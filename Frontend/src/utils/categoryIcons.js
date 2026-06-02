import {
  Tag,
  Car,
  UtensilsCrossed,
  Home,
  Monitor,
  Wrench,
  HeartPulse,
  GraduationCap,
  Coffee,
  Leaf,
  Drumstick,
  Fish,
  Milk,
  Wheat,
  Croissant,
  Flame,
  PawPrint,
  Pill,
  Sparkles,
  Dumbbell,
  Shirt,
  Gamepad2,
  Paperclip,
  PaintBucket,
  Building2,
  Truck,
  Palette,
  IceCream,
  Wine,
  Bike,
  BedDouble,
  Briefcase,
  CalendarDays,
  Megaphone,
  Wifi,
  ShieldCheck,
  Sofa,
  Gem
} from "lucide-react";

export function getCategoryIcon(categoryName) {
  const nameLower = categoryName.toLowerCase();
  
  if (nameLower.includes("cafetería") || nameLower.includes("café")) return Coffee;
  if (nameLower.includes("restauran") || nameLower.includes("comida")) return UtensilsCrossed;
  if (nameLower.includes("frutas") || nameLower.includes("verduras") || nameLower.includes("orgánicos") || nameLower.includes("agro")) return Leaf;
  if (nameLower.includes("carnes") || nameLower.includes("pollo")) return Drumstick;
  if (nameLower.includes("pescados") || nameLower.includes("mariscos")) return Fish;
  if (nameLower.includes("lácteos") || nameLower.includes("huevos")) return Milk;
  if (nameLower.includes("granos") || nameLower.includes("abarrotes")) return Wheat;
  if (nameLower.includes("panadería") || nameLower.includes("repostería")) return Croissant;
  if (nameLower.includes("condimentos") || nameLower.includes("especias")) return Flame;
  if (nameLower.includes("mascotas") || nameLower.includes("animal")) return PawPrint;
  if (nameLower.includes("farmacia") || nameLower.includes("droguerías")) return Pill;
  if (nameLower.includes("salud") || nameLower.includes("médic") || nameLower.includes("medic")) return HeartPulse;
  if (nameLower.includes("maquillaje") || nameLower.includes("belleza") || nameLower.includes("estética")) return Sparkles;
  if (nameLower.includes("deportes") || nameLower.includes("fitness")) return Dumbbell;
  if (nameLower.includes("moda") || nameLower.includes("accesorios")) return Shirt;
  if (nameLower.includes("videojuegos") || nameLower.includes("gaming")) return Gamepad2;
  if (nameLower.includes("tecnolog") || nameLower.includes("comput") || nameLower.includes("celular")) return Monitor;
  if (nameLower.includes("papelería") || nameLower.includes("oficina")) return Paperclip;
  if (nameLower.includes("hogar") || nameLower.includes("limpieza")) return PaintBucket;
  if (nameLower.includes("ferretería") || nameLower.includes("reparac") || nameLower.includes("mantenimiento")) return Wrench;
  if (nameLower.includes("inmobiliaria")) return Building2;
  if (nameLower.includes("logísticos") || nameLower.includes("transporte")) return Truck;
  if (nameLower.includes("artesanías")) return Palette;
  if (nameLower.includes("heladería") || nameLower.includes("postres")) return IceCream;
  if (nameLower.includes("bar") || nameLower.includes("licores")) return Wine;
  if (nameLower.includes("motos")) return Bike;
  if (nameLower.includes("carros") || nameLower.includes("auto") || nameLower.includes("vehículo")) return Car;
  if (nameLower.includes("hoteles") || nameLower.includes("hospedaje")) return BedDouble;
  if (nameLower.includes("educac") || nameLower.includes("capacitación") || nameLower.includes("colegio") || nameLower.includes("universidad")) return GraduationCap;
  if (nameLower.includes("profesionales") || nameLower.includes("empresas") || nameLower.includes("negocios")) return Briefcase;
  if (nameLower.includes("eventos") || nameLower.includes("entretenimiento")) return CalendarDays;
  if (nameLower.includes("publicidad") || nameLower.includes("marketing")) return Megaphone;
  if (nameLower.includes("telecomunicaciones") || nameLower.includes("internet")) return Wifi;
  if (nameLower.includes("seguridad") || nameLower.includes("vigilancia")) return ShieldCheck;
  if (nameLower.includes("muebles") || nameLower.includes("decoración")) return Sofa;
  if (nameLower.includes("joyería") || nameLower.includes("regalos")) return Gem;
  
  return Tag;
}
