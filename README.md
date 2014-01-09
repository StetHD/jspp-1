JavaScript++
-----------------------

JavaScript++ provides the same familiar C-style language syntax of JavaScript and brings modern language features such as classes; block scoping and constants; pluggable type systems and type safety; packages and modules; comprehensive standard libraries; enhanced regular expressions and PCRE; and more to JavaScript with almost no learning curve through an extended ES3 grammar.

As JavaScript grows and extends its reach beyond the web browser, and larger applications with increasing complexity begin to pop up, the original JavaScript syntax - which was designed for adding small programs and interactivity to web pages - needs to be extended to facilitate development of increasingly complex web applications. With features such as classes, static typing, and a package/module system, JavaScript++ enables large-scale software development that is maintainable, reliable, and economical.

JavaScript++ compiles to ES3-compatible JavaScript and is compatible with IE 5.5 and all versions of Firefox, Chrome, and the vast majority of web browsers dating back to 1999 for the client-side and Node.js, v8, SpiderMonkey, and Rhino on the server-side. Furthermore, JavaScript++ is backwards-compatible with all existing JavaScript code and libraries (jQuery, YUI et al), and JavaScript++ code can seamlessly and easily be embedded into your existing JavaScript code.

The JavaScript++ compiler supports regular JavaScript so there is practically no learning curve. Just pick and choose which JavaScript++ features you want to incorporate and learn on demand.

JavaScript++ incorporates features from Python, Perl, Java/C#, ES4, Harmony, Haskell, and more while incorporating its own unique features. The driving philosophy behind JavaScript++ is productivity, and it will make everything from small scripts to large applications easier and faster to write. Take the mundane out of your JavaScript code and enjoy the good parts of JavaScript with JavaScript++!

-----------------------

Official website: http://www.jspplang.org/
Upcoming: http://jspp.launchrock.com/

Tutorial: http://jspp.javascript.am/tutorial.html

Installation & Usage
---------------------

Getting up and running is quick and simple:

### Browser

1. Open compiler.html in your favorite web browser.

2. Type into the HTML textbox:

let foo = "Hello World";
alert(foo);

3. Click "Compile"

4. Click "Execute" to run the compiled code.

5. Copy the compiled code to a .js file and execute it in your browser or server.

6. Open your browser's console to view the warnings and errors produced by the compiler.

### Command Line

Install via npm:

```
sudo npm install javascript-plusplus -g
```

or if you're building from sources, go to the main directory and do

```
sudo npm install -g
```

Example usages:

```
js++ file1.jspp file2.jspp -o out.js # compile the two files and save to file out.js
cat file1.jspp file2.jspp | js++ - > out.js # same thing, but with stdio pipes
```

Once the CLI compiler has been installed, you can use the build script in bin/build.sh to recursively compile all JS++ files in a project directory:

1. Create a "src" folder in your project directory. This folder stores all your JavaScript++ source files (in .jspp format)
2. Create a "build" folder. This folder stores the compiled files
3. Copy bin/build.sh to your project root directory.
4. Execute ```sh build.sh``` in the command-line to recursively compile all JS++ source files. The directory structure in the "src" folder will be maintained in your compiled "build" folder.
5. Include the compiled .js files from your "build" folder in your project

###REPL

Just start the JavaScript++ program with the ```js++``` command without specifying any input files to launch the JavaScript++ REPL.

Example:

```
js++> [1...5].map(function(x) { return x ** 2 })
[ 1,
  4,
  9,
  16,
  25 ]
js++> foo
[ReferenceError] foo is not defined
```

File Descriptions
-----------------
bin/ - Executables and Binaries  
bin/jspp - CLI compiler  
bin/build.sh - Bash script for recursively compiling all JS++ files

src/ - Parser and compiler source code  
src/jsdefs.js - Lookup tables  
src/jsparse.js - Lexer/parser  
src/compiler.js - Code generator  
src/typed-es3.js - Emulation of typed ES3 environment.  
src/repl.js - JavaScript++ command-line REPL

lib/ - Standard Library  
lib/dom - DOM libraries  
lib/jspp - JavaScript++ libraries.  Language only; does not manipulate or depend on host objects  
lib/jspp/lang/es5.js - Incorporates ES5 features such as array extras and Function.prototype.bind  
lib/jspp/lang/json2.js - JSON library  
lib/server - Server-side JavaScript libraries

typesys/ - Pluggable type systems  
typesys/strict.js - Strong, static typing for JavaScript++

test/ - Unit tests  
test/lib - Unit test libraries and modules  
test/src - Source code for unit tests  
test/classes.html - Unit tests for classes  
test/conditionals.html - Unit tests for conditionals  
test/scopes.html - Unit tests for scopes  
test/typesys-strict.html - Unit tests for #typesys strict

Credits
-------
Brendan Eich - JavaScript & Narcissus  
Guillaume Lathoud - v8/JSC port of Narcissus  
Roger Poon - JavaScript++ Language  
Jussi Kalliokoski - CLI Compiler  
QUnit - QUnit testing framework
