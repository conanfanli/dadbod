export function getIsoDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function debounce(func: (...args) => void, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    const f = () => {
      func.apply(f, args);
    };
    timer = setTimeout(f, timeout);
  };
}
