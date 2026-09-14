<template>
  <section
    :style="{ backgroundImage: `url(${HomeBG})` }"
    class="relative flex items-center justify-center h-screen text-black bg-no-repeat bg-cover"
  >
    <div
      class="hidden max-md:landscape:flex fixed inset-0 z-[9999] items-center justify-center bg-black/95"
    >
      <div class="px-8 text-center text-white">
        <Smartphone
          class="size-24 mx-auto animate-[spin_2s_ease-in-out_infinite] mb-6"
        />
        <h2 class="mb-3 text-3xl font-bold">Portrait Mode Only</h2>
        <p class="text-lg text-gray-300">
          Please rotate your device to continue
        </p>
      </div>
    </div>

    <div
      class="flex flex-col items-center flex-1 h-full gap-20 overflow-hidden md:gap-40 snap-y snap-always scroll-smooth"
    >
      <div
        class="flex flex-col justify-center min-h-screen pt-12 max-w-[20rem] xs:max-w-[30rem] sm:max-w-[70rem] md:max-w-[80rem] lg:max-w-[90rem] gap-10 overflow-hidden"
      >
        <template v-if="isDesktop">
          <div
            v-for="(row, rowIndex) in rows"
            :key="`desktop-${rowIndex}`"
            class="flex items-center flex-shrink-0 gap-20 overflow-hidden"
            :class="row.class"
          >
            <div
              v-for="(candidate, index) in row.candidates"
              :key="index"
              @mouseenter="stopMarquee()"
              @mouseleave="playMarquee()"
              class="desktop-card flex-shrink-0 relative -skew-x-8 cursor-pointer rounded overflow-hidden lg:h-[20rem] lg:w-60 md:h-[20rem] md:w-64"
            >
              <img
                :src="candidate.image"
                loading="lazy"
                :alt="candidate.name"
                class="w-full h-full object-cover hover:scale-105 transform transition-transform duration-300 rounded"
              />

              <div
                class="desktop-overlay absolute bottom-0 flex flex-col items-center justify-center w-full p-6 transition-opacity duration-300 opacity-0 h-[40%] rounded bg-primary"
              >
                <div class="skew-x-8 flex items-center justify-center flex-col">
                  <h1
                    class="desktop-overlay-text font-bold text-xl font-lora text-white"
                  >
                    {{ `No. ${candidate.number}` }}
                  </h1>
                  <h3
                    class="desktop-overlay-text mb-2 font-bold text-center text-white md:text-lg text-nowrap"
                  >
                    {{ candidate.name }}
                  </h3>

                  <div
                    class="flex items-center justify-center gap-2 text-xs text-center"
                  >
                    <span
                      class="desktop-overlay-text px-2 py-1 font-semibold text-white rounded-full shadow-md bg-primary md:px-3 shrink-0"
                    >
                      {{ candidate.course }}
                    </span>
                    <span
                      class="desktop-overlay-text px-2 py-1 font-semibold text-white rounded-full shadow-md bg-primary/80 md:px-3"
                    >
                      {{ candidate.team }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div
            v-for="(row, rowIndex) in rows"
            :key="`mobile-${rowIndex}`"
            class="flex items-center flex-shrink-0 gap-5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth scrollbar-hide"
            style="
              padding-inline: calc((100vw - 11rem) / 2);
              scroll-padding-inline: calc((100vw - 11rem) / 2);
            "
          >
            <div
              v-for="(candidate, index) in row.candidates"
              :key="index"
              class="mobile-card flex-shrink-0 relative -skew-x-8 cursor-pointer overflow-hidden rounded w-44 h-60 snap-center snap-always"
            >
              <img
                :src="candidate.image"
                loading="lazy"
                class="w-full h-full object-cover rounded active:scale-95 transition-transform duration-200"
                :alt="candidate.name"
              />

              <div
                class="mobile-overlay absolute bottom-0 left-0 right-0 flex flex-col items-center justify-center p-4 h-[50%] rounded-b bg-primary opacity-0"
              >
                <div class="skew-x-8 flex items-center justify-center flex-col">
                  <h1
                    class="desktop-overlay-text font-bold text-base font-lora text-white"
                  >
                    {{ `No. ${candidate.number}` }}
                  </h1>
                  <h3
                    class="mobile-overlay-text mb-1 font-bold text-nowrap text-center text-white text-sm"
                  >
                    {{ candidate.name }}
                  </h3>

                  <div
                    class="flex items-center justify-center gap-2 text-xs text-center mt-2"
                  >
                    <span
                      class="mobile-overlay-text px-2 py-1 font-semibold text-white rounded-full shadow-md bg-primary shrink-0"
                    >
                      {{ candidate.course }}
                    </span>
                    <span
                      class="mobile-overlay-text px-2 py-1 font-semibold text-white rounded-full shadow-md bg-primary/80"
                    >
                      {{ candidate.team }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div
      v-if="shouldShowKeyboardHint && isDesktop"
      class="fixed z-50 flex items-center justify-center text-sm bottom-10 right-7"
    >
      <span
        class="px-4 py-2 font-bold text-white shadow-lg bg-primary/90 animate-bounce rounded-2xl"
      >
        Press Space to Play / Pause
      </span>
    </div>
  </section>
</template>

<script lang="ts" setup>
import HomeBG from "../../../assets/images/background.png";
import { Smartphone } from "lucide-vue-next";
import { horizontalLoop } from "../../shared/composables/gsapHorizontalLoop";
import { useDeviceDetection } from "../../shared/composables/useDeviceDetection";
import { onMounted, onUnmounted, ref, watch } from "vue";
import { gsap } from "gsap";

// Female
import Ferrer from "../../../assets/images/FEMALE/1.jpg";
import Vergara from "../../../assets/images/FEMALE/2.jpg";
import Cabuenas from "../../../assets/images/FEMALE/3.jpg";
import Susing from "../../../assets/images/FEMALE/4.jpg";
import Orca from "../../../assets/images/FEMALE/5.jpg";
import Samonte from "../../../assets/images/FEMALE/6.jpg";
import Felipe from "../../../assets/images/FEMALE/7.jpg";
import Panagsagan from "../../../assets/images/FEMALE/8.jpg";
import Sena from "../../../assets/images/FEMALE/9.jpg";
import Bernardo from "../../../assets/images/FEMALE/10.jpg";

// Male
import Alangilan from "../../../assets/images/MALE/1.jpg";
import Senador from "../../../assets/images/MALE/2.jpg";
import Paniza from "../../../assets/images/MALE/3.jpg";
import Nuhay from "../../../assets/images/MALE/4.jpg";
import Ramiso from "../../../assets/images/MALE/5.jpg";
import Miguel from "../../../assets/images/MALE/6.jpg";
import Lopez from "../../../assets/images/MALE/7.jpg";
import Rubia from "../../../assets/images/MALE/8.jpg";
import Canete from "../../../assets/images/MALE/9.jpg";
import Chan from "../../../assets/images/MALE/10.jpg";

const { isDesktop, shouldShowKeyboardHint } = useDeviceDetection();

interface Candidate {
  number: number;
  name: string;
  team: string;
  course: string;
  image: string;
  gender?: string;
}

const candidates: Candidate[] = [
  // Female candidates
  {
    number: 1,
    name: "Venus Nicole Ferrer",
    team: "Black Stallion",
    course: "BSOA",
    image: Ferrer,
    gender: "Female",
  },
  {
    number: 2,
    name: "Laarni Vergara",
    team: "White Wolves",
    course: "SHS",
    image: Vergara,
    gender: "Female",
  },
  {
    number: 3,
    name: "Jade Cabuenas",
    team: "White Wolves",
    course: "BSIT",
    image: Cabuenas,
    gender: "Female",
  },
  {
    number: 4,
    name: "Princess Jamaica Susing",
    team: "Purple Hawk",
    course: "BSHM",
    image: Susing,
    gender: "Female",
  },
  {
    number: 5,
    name: "Rhean Faith Orca",
    team: "Green Dragon",
    course: "BSHM",
    image: Orca,
    gender: "Female",
  },
  {
    number: 6,
    name: "Carmela Samonte",
    team: "Red Vipers",
    course: "BSOA",
    image: Samonte,
    gender: "Female",
  },
  {
    number: 7,
    name: "Jean Ryaen Felipe",
    team: "Green Dragon",
    course: "BSHM",
    image: Felipe,
    gender: "Female",
  },
  {
    number: 8,
    name: "Althea Panagsagan",
    team: "Purple Hawk",
    course: "BSHM",
    image: Panagsagan,
    gender: "Female",
  },
  {
    number: 9,
    name: "Yashira Coleen Sena",
    team: "Black Stallion",
    course: "SHS",
    image: Sena,
    gender: "Female",
  },
  {
    number: 10,
    name: "Alleria Bernardo",
    team: "Red Vipers",
    course: "BSOA",
    image: Bernardo,
    gender: "Female",
  },
  // Male candidates
  {
    number: 1,
    name: "Louie Alangilan",
    team: "Black Stallion",
    course: "SHS",
    image: Alangilan,
    gender: "Male",
  },
  {
    number: 2,
    name: "David Imanuel Senador",
    team: "White Wolves",
    course: "SHS",
    image: Senador,
    gender: "Male",
  },
  {
    number: 3,
    name: "Rey Eldrine Paniza",
    team: "White Wolves",
    course: "BSIT",
    image: Paniza,
    gender: "Male",
  },
  {
    number: 4,
    name: "Froilan Nuhay",
    team: "Purple Hawk",
    course: "BSIT",
    image: Nuhay,
    gender: "Male",
  },
  {
    number: 5,
    name: "Gabriel Ramiso",
    team: "Green Dragon",
    course: "BSIT",
    image: Ramiso,
    gender: "Male",
  },
  {
    number: 6,
    name: "John Israel Miguel",
    team: "Red Vipers",
    course: "BSIT",
    image: Miguel,
    gender: "Male",
  },
  {
    number: 7,
    name: "John Caleb Lopez",
    team: "Green Dragon",
    course: "BSIS",
    image: Lopez,
    gender: "Male",
  },
  {
    number: 8,
    name: "Jade Azryll Rubia",
    team: "Purple Hawk",
    course: "BSHM",
    image: Rubia,
    gender: "Male",
  },
  {
    number: 9,
    name: "Kiann Jay Cañete",
    team: "Black Stallion",
    course: "BSHM",
    image: Canete,
    gender: "Male",
  },
  {
    number: 10,
    name: "Ralph Louie Chan",
    team: "Red Vipers",
    course: "BSIS",
    image: Chan,
    gender: "Male",
  },
];

const females = candidates.filter((d) => d.gender === "Female");
const males = candidates.filter((d) => d.gender === "Male");

const rows = [
  {
    candidates: females,
    reversed: false,
    class: "box-row-females",
  },
  {
    candidates: males,
    reversed: true,
    class: "box-row-males",
  },
];

let loops: any[] = [];
const isPlaying = ref(false);
let desktopEventListeners: Array<{
  element: HTMLElement;
  event: string;
  handler: () => void;
}> = [];

const stopMarquee = () => {
  loops.forEach((l) => l.pause());
  isPlaying.value = false;
};

const playMarquee = () => {
  loops.forEach((loop, i) => {
    loop.play();
    if (rows[i] && rows[i].reversed) loop.reverse();
  });
  isPlaying.value = true;
};

const handleSpace = (e: KeyboardEvent) => {
  if (e.code === "Space" && isDesktop.value) {
    e.preventDefault();
    isPlaying.value ? stopMarquee() : playMarquee();
  }
};

const cleanupDesktopEventListeners = () => {
  desktopEventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  desktopEventListeners = [];
};

const initDesktopAnimations = () => {
  cleanupDesktopEventListeners();

  rows.forEach((row) => {
    const boxes = gsap.utils.toArray<HTMLElement>(
      `.${row.class} .desktop-card`
    );
    const loop = horizontalLoop(boxes, {
      paused: false,
      repeat: -1,
      paddingRight: 80,
      reversed: row.reversed,
    });
    loops.push(loop);
    if (row.reversed) loop.reverse();
  });

  const allBoxes = gsap.utils.toArray<HTMLElement>(".desktop-card");
  allBoxes.forEach((box) => {
    const overlay = box.querySelector(".desktop-overlay") as HTMLElement;
    const overlayText = box.querySelectorAll(".desktop-overlay-text");

    gsap.set(overlay, { yPercent: 100, opacity: 0 });
    gsap.set(overlayText, { y: 20, opacity: 0 });

    const tl = gsap
      .timeline({ paused: true })
      .fromTo(
        overlay,
        { yPercent: 100, opacity: 1 },
        { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
      )
      .to(
        overlayText,
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.1, ease: "power2.out" },
        "-=0.2"
      );

    const mouseEnterHandler = () => tl.play();
    const mouseLeaveHandler = () => tl.reverse();

    box.addEventListener("mouseenter", mouseEnterHandler);
    box.addEventListener("mouseleave", mouseLeaveHandler);

    desktopEventListeners.push(
      { element: box, event: "mouseenter", handler: mouseEnterHandler },
      { element: box, event: "mouseleave", handler: mouseLeaveHandler }
    );
  });

  isPlaying.value = true;
};

const cleanupDesktopAnimations = () => {
  loops.forEach((l) => l.kill?.());
  loops = [];
  cleanupDesktopEventListeners();
  isPlaying.value = false;
};

let mobileTimelines: gsap.core.Timeline[] = [];
let mobileEventListeners: Array<{
  element: HTMLElement;
  event: string;
  handler: () => void;
}> = [];

const cleanupMobileEventListeners = () => {
  mobileEventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  mobileEventListeners = [];
};

const initMobileAnimations = () => {
  cleanupMobileEventListeners();

  mobileTimelines.forEach((tl) => tl.kill());
  mobileTimelines = [];

  setTimeout(() => {
    const allMobileCards =
      document.querySelectorAll<HTMLElement>(".mobile-card");

    allMobileCards.forEach((card, i) => {
      const overlay = card.querySelector(".mobile-overlay") as HTMLElement;
      const overlayText = card.querySelectorAll(".mobile-overlay-text");

      gsap.set(overlay, { y: "100%", opacity: 0 });
      gsap.set(overlayText, { y: 20, opacity: 0 });

      const tl = gsap
        .timeline({ paused: true })
        .to(overlay, {
          y: "0%",
          opacity: 1,
          duration: 0.5,
          ease: "power3.out",
        })
        .to(
          overlayText,
          {
            y: 0,
            opacity: 1,
            duration: 0.3,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.2"
        );

      mobileTimelines.push(tl);

      let isOpen = false;

      const clickHandler = () => {
        mobileTimelines.forEach((otherTl, j) => {
          if (j !== i) otherTl.reverse();
        });

        if (isOpen) {
          tl.reverse();
        } else {
          tl.play();
        }
        isOpen = !isOpen;
      };

      card.addEventListener("click", clickHandler);

      mobileEventListeners.push({
        element: card,
        event: "click",
        handler: clickHandler,
      });
    });
  }, 100);
};

const cleanupMobileAnimations = () => {
  mobileTimelines.forEach((tl) => tl.kill());
  mobileTimelines = [];
  cleanupMobileEventListeners();
};

watch(isDesktop, (newIsDesktop) => {
  if (newIsDesktop) {
    cleanupMobileAnimations();
    setTimeout(() => initDesktopAnimations(), 100);
  } else {
    cleanupDesktopAnimations();
    setTimeout(() => initMobileAnimations(), 100);
  }
});

onMounted(() => {
  if (isDesktop.value) {
    initDesktopAnimations();
  } else {
    initMobileAnimations();
  }
  window.addEventListener("keydown", handleSpace);
});

onUnmounted(() => {
  cleanupDesktopAnimations();
  cleanupMobileAnimations();
  window.removeEventListener("keydown", handleSpace);
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
