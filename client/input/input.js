const alphabet = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz'.split('');

let array = [];
for(let i = 0; i < 1000001; i++) {
    let random = Math.floor(Math.random() * alphabet.length);
    console.log(alphabet[random]);
}
console.log(array.join('\n'));

const proc = Bun.spawn(['ls', '-a']);
const text = await new Response(proc.stdout).text();
console.log(text);
