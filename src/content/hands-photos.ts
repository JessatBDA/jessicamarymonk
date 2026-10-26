import type { StaticImageData } from "next/image";
import hands01 from "../../images/hands-01.jpg";
import hands02 from "../../images/hands-02.jpg";
import hands03 from "../../images/hands-03.jpg";
import hands04 from "../../images/hands-04.jpg";
import hands05 from "../../images/hands-05.jpg";
import hands06 from "../../images/hands-06.jpg";
import hands07 from "../../images/hands-07.jpg";
import hands08 from "../../images/hands-08.jpg";
import hands09 from "../../images/hands-09.jpg";
import hands10 from "../../images/hands-10.jpg";
import hands11 from "../../images/hands-11.jpg";

export type HandsPhoto = {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
};

function photo(
  image: StaticImageData,
  alt: string,
  caption: string,
): HandsPhoto {
  return {
    src: image.src,
    width: image.width,
    height: image.height,
    alt,
    caption,
  };
}

/** The whole sculpture on the Worcester Plinth container. Used as the page hero. */
export const handsHero = photo(
  hands02,
  "The Hands of Worcester on the Worcester Plinth container in a city square, with rows of painted hand casts and an interpretation panel in front.",
  "The Hands of Worcester on the Worcester Plinth container.",
);

/**
 * Photographs supplied for the web. People are described only by what they are
 * doing. Names are not added.
 */
export const handsGallery: HandsPhoto[] = [
  handsHero,
  photo(
    hands01,
    "Close view of painted hand casts fixed along the black Worcester Plinth container, with a hand-shaped opening in the side.",
    "Painted casts on the plinth container.",
  ),
  photo(
    hands06,
    "A wide view of The Hands of Worcester on the plinth container in a public square, with the interpretation panel and painted casts.",
    "The installation in the square.",
  ),
  photo(
    hands04,
    "Rows of brightly painted hand casts mounted on the black plinth container.",
    "Painted hand casts.",
  ),
  photo(
    hands08,
    "The finished Hands of Worcester installation against a pale stone building, the black container covered with painted hand casts.",
    "The finished plinth container.",
  ),
  photo(
    hands03,
    "Two people working together on the Worcester Plinth container during a build day.",
    "A build day on the plinth.",
  ),
  photo(
    hands05,
    "A person at a work table painting or sealing a hand cast during the making of The Hands of Worcester, with tools and cloths beside them.",
    "Working on a cast.",
  ),
  photo(
    hands07,
    "Three people kneeling to work on the Worcester Plinth container on a build day.",
    "Working along the container.",
  ),
  photo(
    hands09,
    "A person in a blue jacket kneels to work on the Worcester Plinth container outdoors.",
    "Work on the container outdoors.",
  ),
  photo(
    hands10,
    "A build day for The Hands of Worcester, with several people around the plinth container and one person holding a camera.",
    "The build, with the casts laid out.",
  ),
  photo(
    hands11,
    "Three people on a build day, one wearing a yellow high-visibility vest, working beside the plinth container.",
    "The build day crew.",
  ),
];

export const earlierInstallation: HandsPhoto[] = [
  {
    src: "/images/hands-of-worcester/installation-1.webp",
    width: 2000,
    height: 1500,
    alt: "The Hands of Worcester on a wooden plinth in a Worcester public square, with rows of painted hand casts sealed in resin and an interpretation panel in front.",
    caption: "The hands on the plinth.",
  },
  {
    src: "/images/hands-of-worcester/installation-2.webp",
    width: 1200,
    height: 1600,
    alt: "Close view of painted plaster hand casts, sealed in clear resin blocks, mounted in rows.",
    caption: "Casts sealed in resin.",
  },
  {
    src: "/images/hands-of-worcester/installation-3.webp",
    width: 2000,
    height: 1500,
    alt: "The Hands of Worcester installation in a city square, seen from a corner, with the hand casts along the plinth and the panel beside it.",
    caption: "The installation in the square.",
  },
];
