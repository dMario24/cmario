/** 터치 버튼(React)과 게임 씬(Phaser)이 함께 읽고 쓰는 입력 상태 */
export const touchInput = { left: false, right: false, jump: false };

export function resetTouchInput() {
  touchInput.left = false;
  touchInput.right = false;
  touchInput.jump = false;
}
