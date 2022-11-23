var a = 2;
var obj = {
  a: 4,
  fn1: (function () {
    this.a *= 2;
    var a = 3;
    return function () {
      this.a *= 2;
      a *= 3;
      console.log(a);
    }
  })()
}
var fn1 = obj.fn1;
console.log(a);
fn1();
obj.fn1();
console.log(a);
console.log(obj.a);
// test gpg