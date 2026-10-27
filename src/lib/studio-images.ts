import type { StaticImageData } from "next/image";
import art01 from "../../images/studio/art-01.jpg";
import art02 from "../../images/studio/art-02.jpg";
import art03 from "../../images/studio/art-03.jpg";
import art04 from "../../images/studio/art-04.jpg";
import art05 from "../../images/studio/art-05.jpg";
import art06 from "../../images/studio/art-06.jpg";
import art07 from "../../images/studio/art-07.jpg";
import art08 from "../../images/studio/art-08.jpg";
import art09 from "../../images/studio/art-09.jpg";
import art10 from "../../images/studio/art-10.jpg";
import art11 from "../../images/studio/art-11.jpg";
import art12 from "../../images/studio/art-12.jpg";
import seascape from "../../images/studio/seascape.jpg";

/** Repo files shipped with the seed. Admin uploads use /media instead. */
export const studioImages: Record<string, StaticImageData> = {
  "art-01.jpg": art01,
  "art-02.jpg": art02,
  "art-03.jpg": art03,
  "art-04.jpg": art04,
  "art-05.jpg": art05,
  "art-06.jpg": art06,
  "art-07.jpg": art07,
  "art-08.jpg": art08,
  "art-09.jpg": art09,
  "art-10.jpg": art10,
  "art-11.jpg": art11,
  "art-12.jpg": art12,
  "seascape.jpg": seascape,
};
