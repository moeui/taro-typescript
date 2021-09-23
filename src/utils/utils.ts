export function buf2hex(buffer): string {
    return Array.prototype.map
        .call(new Uint8Array(buffer), (x) => ("00" + x.toString(16)).slice(-2))
        .join("");
}
export function buf2string(buffer): string {
    const arr = Array.prototype.map.call(new Uint8Array(buffer), (x) => x);
    let str = "";
    for (let i = 0; i < arr.length; i++) {
        str += String.fromCharCode(arr[i]);
    }
    return str;
}
export function getShortenAddress(address): string {
    const firstCharacters = address.substring(0, 10)
    const lastCharacters = address.substring(address.length - 10, address.length)
    return `${firstCharacters}...${lastCharacters}`
}