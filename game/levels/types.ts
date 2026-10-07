/**
 * 레벨 맵 범례 (한 글자 = 16px 타일 하나)
 *
 *  .  빈칸            #  땅(흙/풀)         R  돌·벽돌 블록      K  배 선체(고체)
 *  =  나무 발판(아래에서 통과 가능)        ~  물(빠지면 체크포인트로)
 *  ^  가시덤불        W  출렁이는 파도     B  움직이는 배(3칸, 오른쪽으로 4칸 왕복)
 *  *  은총의 빛       b  빵                f  물고기             p  종려가지
 *  C  등불(체크포인트) N  등장인물(npcLines 순서대로 말함)     M  군중(장식)
 *  D  비둘기(장식)    P  마르코 시작 위치
 *  J  예수님 — 맵에 O가 없으면 도착 지점
 *  O  지붕의 구멍 — 있으면 이곳이 도착 지점
 */
export type Weather = "clear" | "storm" | "dusk";

export type Requirement = { bread?: number; fish?: number; palm?: number };

export type CutsceneSlide = {
  title: string;
  ref: string;
  text: string;
  art: "supper" | "garden" | "cross" | "tomb" | "galilee";
};

export type Level = {
  slug: string;
  title: string;
  place: string;
  ref: string;
  intro: string[];
  outro: { words: string; wordsRef: string; meditation: string };
  npcLines: string[];
  requires?: Requirement;
  weather: Weather;
  sky: [top: string, bottom: string];
  hills: [far: string, near: string];
  /** 'R' 블록 색상 계열 */
  stone?: "sand" | "town";
  /** 예수님 모습: 서 계심(기본) · 배에서 주무심 · 나귀를 타심 */
  jesusPose?: "stand" | "sleep" | "donkey";
  cutscene?: CutsceneSlide[];
  map: string[];
};
