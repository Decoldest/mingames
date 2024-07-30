import keyboard from "../assets/keyboard.svg";
import drink from "../assets/drink.svg";
import trophy from "../assets/trophy.svg";
import wrong from "../assets/wrong.svg";
import repeat from "../assets/repeat.svg";

export default function HowToPlay() {
  return (
    <section className="flex flex-col w-80 sm:w-96">
      <ul className="bg-slate-100 p-4 rounded-2xl how-to-play">
        <p className="text-cyan-900">How To Play</p>
        <li>
          <img src={keyboard} alt="Keyboard Icon" className="w-6" />
          Select a minigame
        </li>
        <li>
          <img src={drink} alt="Drink Icon" className="w-6" />
          Place your drink wagers
        </li>
        <li>
          {" "}
          <img src={trophy} alt="Tropy Icon" className="w-6" />
          If you win, vote on who should drink
        </li>
        <li>
          {" "}
          <img src={wrong} alt="Thumbs Down Icon" className="w-6" />
          If you lose, take your drink
        </li>
        <li><img src={repeat} alt="Repeat Icon" className="w-6"/>Repeat</li>
      </ul>
    </section>
  );
}
