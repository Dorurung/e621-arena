import { useEffect, useState } from 'react';
import characters from './characters.json'
import './e621Arena.css'

export default function E621Arena() {
  const [allChars, setAllChars] = useState(characters);
  const [mode, setMode] = useState("all");
  const [pool, setPool] = useState([]);

  useEffect(() => {
        setGameStarted(false)
      }, []);

  // current pair
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);

  // which side has visible count? 'left' or 'right'
  const [visibleSide, setVisibleSide] = useState('left');
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);


  // pick next opponent, keeping the revealed-character
  function nextRound() {
    setLeft(pool[score+1]);
    setRight(pool[score+2]);
    setVisibleSide('left');
    setRevealed(false);
    setAnimating(false);
    setHighlightSide(null);
    setRevealedCount(null);
    setAsnwer(null)
  }

  function restart() {
    const shuffled = shuffle(allChars.filter(c => (mode === 'all' ? c.all === true : c.male === true)))
    setPool(shuffled);
    setScore(0);
    setGameOver(false);
    setRevealed(false);
    setLeft(shuffled[0]);
    setRight(shuffled[1]);
    setVisibleSide('left');
    setGameStarted(true);
    setAnimating(false);
    setHighlightSide(null);
    setRevealedCount(null);
    setAsnwer(null)
  }
  // when pool or mode changes, (re)initialize game
  useEffect(() => {
    restart()
  }, [mode]);

  // small helpers
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Determine what to show for counts
  const leftCountVisible = visibleSide === 'left' || revealed;
  const rightCountVisible = visibleSide === 'right' || revealed;

  function getImgUrl(mode, name) {
    return new URL(`./images_${mode}/${name}.webp`, import.meta.url).href
  }

  // 상태 추가
  const [revealedCount, setRevealedCount] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [highlightSide, setHighlightSide] = useState<string | null>(null);
  const [answer, setAsnwer] = useState<string | null>(null);

  // 선택 처리 함수
  const handleChoice = (chosenSide) => {
    if (animating) return; // 중복 입력 방지
    const chosen = chosenSide === 'left' ? left : right;
    const other = chosenSide === 'left' ? right : left;
    setAnimating(true);

    const answer = left.count > right.count ? "left" : "right"
    const isCorrect = chosen.count >= other.count;
    const hiddenValue = right.count;

    setHighlightSide(chosenSide);

    // 숫자 카운트 애니메이션
    let current = 0;
    setRevealedCount(0);
    const interval = setInterval(() => {
      current += Math.ceil(hiddenValue / 30); // 30프레임 정도로 나눠서 상승
      if (current >= hiddenValue) {
        clearInterval(interval);
        setRevealedCount(hiddenValue);
        setAsnwer(answer)
      } else {
        setRevealedCount(current);
      }
    }, 20);

    // 2초 후 결과 처리
    setTimeout(() => {
      if (isCorrect) {
        setScore(s => s + 1);
        nextRound();
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <header className="flex items-center flex-col justify-between mb-4">
        <h1 className="text-2xl font-extrabold">E621 캐릭터 짤 개수 월드컵 (2025. 09. 14. 기준)</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm">모드: </label>
          <select value={mode} onChange={e => setMode(e.target.value)} className="rounded p-1 border">
            <option value="all">전체</option>
            <option value="male">남자 캐릭터만</option>
          </select>
        </div>
      </header>

      {gameStarted && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CharacterCard side="left" data={left} image={getImgUrl(mode, left.name)} countVisible={leftCountVisible} onChoose={() => handleChoice('left')} highlightSide={highlightSide} animating={animating} revealedCount={revealedCount} answer={answer}   />
            <CharacterCard side="right" data={right} image={getImgUrl(mode, right.name)} countVisible={rightCountVisible} onChoose={() => handleChoice('right')} highlightSide={highlightSide} animating={animating} revealedCount={revealedCount} answer={answer} />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <div className="text-sm">현재 연속 정답: <strong>{score}</strong></div>
              <div className="text-xs text-gray-500">왼쪽의 짤 개수만 공개됩니다. 더 많을 것 같은 캐릭터를 고르세요.</div>
              <div className="text-xs text-gray-500">썸네일은 해당 캐릭터가 포함된 건전짤 중 제일 점수가 높은 짤이어서 크게 상관없는 짤이 나올 수도 있습니다.<br></br>썸네일이 깨지는 거면 태그는 있는데 건전짤이 없는 겁니다.</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border" onClick={restart}>다시 시작</button>
            </div>
          </div>
        </div>
      )}

      {gameOver && (
        <div className="mt-4 bg-red-50 border border-red-200 p-3 rounded">
          <div className="font-bold">게임 오버</div>
          <div className="mt-1">최종 연속 정답: {score}</div>
          <div className="mt-2"><button className="px-3 py-1 rounded border" onClick={restart}>다시 도전</button></div>
        </div>
      )}
    </div>
  );
}

function CharacterCard({ side, data, image, countVisible, onChoose, highlightSide, animating, revealedCount, answer }) {
  return (
    <button
      key={side}
      onClick={() => onChoose()}
      disabled={animating}
        className={`relative flex flex-col items-center border rounded p-2
          ${highlightSide === side ? "ring-4 ring-green-500" : ""}
          ${answer === side ? "animate-scale-pop" : ""}
          ${animating ? "cursor-not-allowed" : ""}
        `}
    >
      <img
        src={image}
        alt={data.name}
        className="w-full h-auto object-contain"
      />
      <div className="p-4 text-center">
        <a className="text-lg font-semibold text-blue-600 underline" href={`https://e621.net/posts?tags=${data.name} rating:s`} target="_blank" onClick={e => e.stopPropagation()}>{data.name}</a>
        <div className="text-sm text-gray-500">{data.gender || ''}</div>
        <div className="mt-2">
          {countVisible ? (
            <div className="text-xl font-bold">짤 개수: {data.count}</div>
          ) : (revealedCount !== null && side == "right") ? (
            <div className="text-xl font-bold">짤 개수: {revealedCount.toLocaleString()}</div>
          ) : (
            <div className="text-xl font-bold">짤 개수: ?</div>
          )}
        </div>
      </div>
    </button>
  );
}