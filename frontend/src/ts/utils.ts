export function getFileURI(file: File) {
  return new Promise<string>((res, rej) => {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      if (target?.result) res(target.result as string);
      else rej();
    };
    reader.readAsDataURL(file);
  });
}
