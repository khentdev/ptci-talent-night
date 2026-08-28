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
                    class="desktop-overlay-text mb-2 font-bold text-center text-white md:text-xl text-nowrap"
                  >
                    {{ candidate.name }}
                  </h3>

                  <div
                    class="flex items-center justify-center gap-2 text-xs text-center"
                  >
                    <span
                      class="desktop-overlay-text px-2 py-1 font-semibold text-white rounded-full shadow-md bg-primary md:px-3 shrink-0"
                    >
                      {{ candidate.year }}
                    </span>
                    <span
                      class="desktop-overlay-text px-2 py-1 font-semibold text-white rounded-full shadow-md bg-primary/80 md:px-3"
                    >
                      {{ candidate.course }}
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
                      {{ candidate.year }}
                    </span>
                    <span
                      class="mobile-overlay-text px-2 py-1 font-semibold text-white rounded-full shadow-md bg-primary/80"
                    >
                      {{ candidate.course }}
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
import Aniar from "../../../assets/images/F8.jpg";
import DelaCruz from "../../../assets/images/F6.jpg";
import DelosSantos from "../../../assets/images/F2.jpg";
import Tindog from "../../../assets/images/F1.jpg";
import Buenaflor from "../../../assets/images/F4.jpg";
import Gabuco from "../../../assets/images/F7.jpg";
import Badang from "../../../assets/images/F10.jpg";
import Lungcay from "../../../assets/images/F9.jpg";
import Cortez from "../../../assets/images/F3.jpg";
import Floria from "../../../assets/images/F5.jpg";

// Male
import Paniza from "../../../assets/images/M8.jpg";
import Montserate from "../../../assets/images/M3.jpg";
import Napolitano from "../../../assets/images/M10.jpg";
import Reyes from "../../../assets/images/M2.jpg";
import Avelino from "../../../assets/images/M4.jpg";
import Nuhay from "../../../assets/images/M6.jpg";
import Miguel from "../../../assets/images/M7.jpg";
import Mendoza from "../../../assets/images/M5.jpg";
import Palay from "../../../assets/images/M1.jpg";
import Tenorio from "../../../assets/images/M9.jpg";

const { isDesktop, shouldShowKeyboardHint } = useDeviceDetection();

interface Candidate {
  number: number;
  name: string;
  team: string;
  year: string;
  course: string;
  image: string;
  gender?: string;
}

const candidates: Candidate[] = [
  // Female candidates
  {
    number: 1,
    name: "Andrea Mae Aniar",
    team: "Yellow Predators",
    year: "3rd Year",
    course: "BSOA",
    image: Aniar,
    gender: "Female",
  },
  {
    number: 2,
    name: "Christine Dela Cruz",
    team: "Purple Gladiators",
    year: "1st Year",
    course: "BSHM",
    image: DelaCruz,
    gender: "Female",
  },
  {
    number: 3,
    name: "Jona May Delos Santos",
    team: "Purple Gladiators",
    year: "1st Year",
    course: "BSHM",
    image: DelosSantos,
    gender: "Female",
  },
  {
    number: 4,
    name: "Rhea Tindog",
    team: "Green Warriors",
    year: "1st Year",
    course: "BSOA",
    image: Tindog,
    gender: "Female",
  },
  {
    number: 5,
    name: "Roela Buenaflor",
    team: "Green Warriors",
    year: "1st Year",
    course: "BSIT",
    image: Buenaflor,
    gender: "Female",
  },

  {
    number: 6,
    name: "Janguem Gabuco",
    team: "Red Avengers",
    year: "1st Year",
    course: "BSENVI",
    image: Gabuco,
    gender: "Female",
  },
  {
    number: 7,
    name: "Ethel Badang",
    team: "Red Avengers",
    year: "1st Year",
    course: "ACT",
    image: Badang,
    gender: "Female",
  },
  {
    number: 8,
    name: "Keanna Lungcay",
    team: "Blue Raptors",
    year: "Senior High",
    course: "BFA",
    image: Lungcay,
    gender: "Female",
  },
  {
    number: 9,
    name: "Ivy Cortez",
    team: "Yellow Predators",
    year: "1st Year",
    course: "BSIT",
    image: Cortez,
    gender: "Female",
  },
  {
    number: 10,
    name: "Quezada Floria",
    team: "Blue Raptors",
    year: "3rd Year",
    course: "BSHM",
    image: Floria,
    gender: "Female",
  },
  // Male candidates
  {
    number: 1,
    name: "Ray Eldrine Paniza",
    team: "Yellow Predators",
    year: "1st Year",
    course: "BSIT",
    image: Paniza,
    gender: "Male",
  },
  {
    number: 2,
    name: "Kevin Monserate",
    team: "Purple Gladiators",
    year: "1st Year",
    course: "BSIT",
    image: Montserate,
    gender: "Male",
  },
  {
    number: 3,
    name: "Joe Mharie Napolitano",
    team: "Purple Gladiators",
    year: "1st Year",
    course: "BSHM",
    image: Napolitano,
    gender: "Male",
  },
  {
    number: 4,
    name: "Philipe Reyes",
    team: "Green Warriors",
    year: "1st Year",
    course: "BSIT",
    image: Reyes,
    gender: "Male",
  },
  {
    number: 5,
    name: "Kenth Francis Avelino",
    team: "Green Warriors",
    year: "1st Year",
    course: "BSHM",
    image: Avelino,
    gender: "Male",
  },
  {
    number: 6,
    name: "Sean Steve Tenorio",
    team: "Red Avengers",
    year: "1st Year",
    course: "BSIT",
    image: Tenorio,
    gender: "Male",
  },
  {
    number: 7,
    name: "Froilan Nuhay",
    team: "Red Avengers",
    year: "1st Year",
    course: "BSIT",
    image: Nuhay,
    gender: "Male",
  },
  {
    number: 8,
    name: "John Israel Miguel ",
    team: "Blue Raptors",
    year: "1st Year",
    course: "BSIT",
    image: Miguel,
    gender: "Male",
  },
  {
    number: 9,
    name: "John Fritz Mendoza",
    team: "Yellow Predators",
    year: "1sr Year",
    course: "BSIT",
    image: Mendoza,
    gender: "Male",
  },
  {
    number: 10,
    name: "Roldan Palay",
    team: "Blue Raptors",
    year: "1st Year",
    course: "BSCS",
    image: Palay,
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
