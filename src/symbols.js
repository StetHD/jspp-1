// ==================================================================================================================================
//	   _____                 __          __   ______      __    __   
//	  / ___/__  ______ ___  / /_  ____  / /  /_  __/___ _/ /_  / /__ 
//	  \__ \/ / / / __ `__ \/ __ \/ __ \/ /    / / / __ `/ __ \/ / _ \
//	 ___/ / /_/ / / / / / / /_/ / /_/ / /    / / / /_/ / /_/ / /  __/
//	/____/\__, /_/ /_/ /_/_.___/\____/_/    /_/  \__,_/_.___/_/\___/ 
//	     /____/                                                      
// ==================================================================================================================================	
 
function SymbolTablePlugin(compiler)
{     
	var _this = this;
	var _compiler = compiler;
	//_compiler.SymbolTable=_this;
    
	this.scopeTable = [];    
	this.debugSymbols = [];
	this.codeSymbols = [];
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.insertScope = function(id,node)
	{ 
		var tokenType = node.type;
		var isGlobalScope = _compiler.scopeChain.length == 1;		
		
		if (tokenType === jsdef.SCRIPT && !isGlobalScope) 
			tokenType = jsdef.FUNCTION;
		
		var offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(node.lineno-_compiler.currFileStartLine)+1);			
		this.scopeTable.push({
			file		: _compiler.currFile || undefined							  
			, line		: node.lineno - _compiler.currFileStartLine
			, start		: node.start - offset
			, end		: node.end - offset
			, length	: node.end -node.start 
			, scopeId	: id				  
			, name		: isGlobalScope ? "__GLOBAL__" : node.name
			, token		: tokenType				
		});
	};
													
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.getSymbolTableScopeId = function() 
	{
		var currentScope = _compiler.CurrentScope(), scopeId = -1;
		switch (currentScope.type) {
			case jsdef.SCRIPT:
			case jsdef.BLOCK:
				return currentScope.scopeId;
			case jsdef.CLASS:
				return currentScope.body.scopeId;
		}
		
		return -1;
	};  
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.NewDebugSymbol = function(symbolType, node, identifier, symbol)
	{		
		var offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(node.lineno-_compiler.currFileStartLine)+1);		
		var Symbol = {		
			file	: _compiler.currFile || undefined,			
			type	: symbolType,																
			lineno	: node.lineno - _compiler.currFileStartLine,
			start	: node.start - offset,
			end		: node.end - offset,
			scopeId : _this.getSymbolTableScopeId(),
			name	: identifier,
			symbol	: symbol			
		};
		_this.debugSymbols.push(Symbol);		
		return Symbol;
	};
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.NewCodeSymbol = function(varItem)
	{		
		var datatype = varItem.vartype ? varItem.vartype : _this.detectDataType(varItem);		
		if(!datatype) return;
		var offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(varItem.lineno-_compiler.currFileStartLine)+1);
		
		var Symbol = {		
			file		: _compiler.currFile || undefined,			
			type		: "VAR",																
			class		: _this.currentClass || undefined,				 
			classId		: _this.classId,
			insideClass	: varItem._insideClass,		
			lineno		: varItem.lineno - _compiler.currFileStartLine,
			start		: varItem.start - offset,
			end			: varItem.end - offset,
			scopeId		: _this.getSymbolTableScopeId(),
			public		: varItem.public,
			private		: varItem.private,
			protected	: varItem.protected,
			name		: varItem.identifier,
			datatype	: datatype,
			value		: varItem._value
		};	
						
		_this.codeSymbols.push(Symbol);		
		return Symbol;
	};
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.insertVariable = function(varItem) 
	{
		if(varItem._symbol && varItem.identifier!=varItem._symbol)
		{				
			_this.NewDebugSymbol("IDENTIFIER", varItem, varItem.identifier, varItem._symbol);	
		}
		
		_this.NewCodeSymbol(varItem);
	};
			
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.insertBlockVariable = function(node, newIdentifier, srcIdentifier) 
	{		
		if(srcIdentifier!=newIdentifier)
		{
			_this.NewDebugSymbol("IDENTIFIER", node, srcIdentifier, newIdentifier);
		}
	};
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.insertIdentifier = function(node, out, access) 
	{	
		var symbol = out.join("");
		if(node.value && node.value!=symbol)	
		{			
			_this.NewDebugSymbol("IDENTIFIER", node, node.value, symbol);
		}
	};
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.insertReference = function(node, out)
	{			
		if(node[0] && node[0].value=="prototype")
		{
			//_this.insertPrototypeMember(node, out);
		}
		else
		{
			if(node.value && node.value!="prototype")
				_this.NewDebugSymbol("REFERENCE", node, node.value, out.join(""));
		}
	};
		
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.insertFunction = function(node)
	{
		if(!node.name) return;
		
		var offset = 0;
		var scopeId = compiler.SymbolTable.getSymbolTableScopeId();
		
		var paramsList = [];
		for (var i=0, len=node.paramsList.length; i<len; i++) 
		{
			offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(node.paramsList[i].lineno-_compiler.currFileStartLine)+1);
			paramsList.push({
				  name: node.paramsList[i].value
				, lineno: node.paramsList[i].lineno - _compiler.currFileStartLine
				, start: node.paramsList[i].start  - offset
				, end: node.paramsList[i].end - offset
				, restParameter: !!node.paramsList[i].restParameter				
			});			
		}		
		
		//Record Function Symbol						
		offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(node.lineno-_compiler.currFileStartLine)+1);				
		var FunctionSymbol = {		
			file			: _compiler.currFile || undefined,						
			type			: "FUNCTION",			
			jsdef			: jsdef.FUNCTION,
			name			: node.name,			
			lineno			: node.lineno - _compiler.currFileStartLine,
			start			: node.start - offset,
			end				: node.end - offset,
			scopeId			: scopeId,
			datatype		: node.returntype || undefined,
			paramsList		: paramsList
		};
		
		_this.codeSymbols.push(FunctionSymbol);		
	};
		
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.insertClass = function(node) 
	{
		var offset=0;
		
		//Process class fields
		var classFields = [];
		if (node.body.varDecls) {
			for (var i = 0, len = node.body.varDecls.length; i < len; i++) {
				for (var j = 0; j < node.body.varDecls[i].length; j++) {
					offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(node.body.varDecls[i][j].lineno-_compiler.currFileStartLine)+1);
					
					classFields.push({
						  name: node.body.varDecls[i][j].name
						, lineno: node.body.varDecls[i][j].lineno - _compiler.currFileStartLine
						, start: node.body.varDecls[i][j].start - offset
						, end: node.body.varDecls[i][j].end - offset						
						, datatype: node.body.varDecls[i][j].vartype
						
						, "public": node.body.varDecls[i]["public"]
						, "private": node.body.varDecls[i]["private"]
						, "protected": node.body.varDecls[i]["protected"]
						, "static": node.body.varDecls[i]["static"]
					});
				}
			}
		}
		
		//Process class methods and nested classes
		var classMethods = [];
		var nestedClasses = [];
		if (node.body.funDecls) {
			for (var i = 0, len = node.body.funDecls.length; i < len; i++) {
				if (node.body.funDecls[i].type === jsdef.FUNCTION) {
					var paramsList = [], methodParams = node.body.funDecls[i].paramsList;
					for (var j=0, _len=methodParams.length; j<_len; j++) {												
						offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(methodParams[j].lineno-_compiler.currFileStartLine)+1);
						paramsList.push({
							  name: methodParams[j].value
							, lineno: methodParams[j].lineno - _compiler.currFileStartLine
							, start: methodParams[j].start - offset
							, end: methodParams[j].end - offset
							, restParameter: !!methodParams[j].restParameter
							, datatype: methodParams[j].vartype || undefined
						});
					}
					
					offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(node.body.funDecls[i].lineno-_compiler.currFileStartLine)+1);
					classMethods.push({
						  name: node.body.funDecls[i].name
						, lineno: node.body.funDecls[i].lineno - _compiler.currFileStartLine
						, start: node.body.funDecls[i].start - offset
						, end: node.body.funDecls[i].end - offset
						, datatype: node.body.funDecls[i].returntype || undefined
						, parameters: paramsList
						
						, "public": node.body.funDecls[i]["public"]
						, "private": node.body.funDecls[i]["private"]
						, "protected": node.body.funDecls[i]["protected"]
						, "static": node.body.funDecls[i]["static"]
					});
				}
				else if (node.body.funDecls[i].type === jsdef.CLASS) {
					offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(node.body.funDecls[i].lineno-_compiler.currFileStartLine)+1);
					nestedClasses.push({
						  name: node.body.funDecls[i].name
						, lineno: node.body.funDecls[i].lineno - _compiler.currFileStartLine
						, start: node.body.funDecls[i].start - offset
						, end: node.body.funDecls[i].end - offset
						
						, "public": node.body.funDecls[i]["public"]
						, "private": node.body.funDecls[i]["private"]
						, "protected": node.body.funDecls[i]["protected"]
						, "static": node.body.funDecls[i]["static"]
					});
				}
			}
		}
		
		//Record Class Symbol						
		offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(node.lineno-_compiler.currFileStartLine)+1);				
		var ClassSymbol = {		
			file	: _compiler.currFile || undefined,						
			type	: "CLASS",
			jsdef	: jsdef.CLASS,
			name	: node.name,			
			lineno	: node.lineno - _compiler.currFileStartLine,
			start	: node.start - offset,
			end		: node.end - offset,
			bases	: node["extends"] ? [ node["extends"].value ] : undefined,
			fields	: classFields,
			methods	: classMethods					
		};
		
		//TODO: treat nestedClasses differently
		
		_this.codeSymbols.push(ClassSymbol);
	};
		
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.insertPrototypeMember = function(node, out)
	{
		var classSymbol = null;
		
		// =======================================================================
		// Ensure class exists
		// =======================================================================
		function getClassSymbol(node)
		{			
			for(i in _this.codeSymbols)
			{
				if(!isFinite(i))continue;
				if(_this.codeSymbols[i].type=="CLASS" && _this.codeSymbols[i].name==node.value)
				{
					return _this.codeSymbols[i];
				}
			}			
			var offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(node.lineno-_compiler.currFileStartLine)+1);
			var classSymbol = {		
				file	: _compiler.currFile || undefined,						
				type	: "CLASS",
				proto 	: true,
				jsdef	: jsdef.CLASS,
				name	: node.value,			
				lineno	: node.lineno - _compiler.currFileStartLine,
				start	: node.start - offset,
				end		: node.end - offset,
				bases	: ["Object"],
				fields	: [],
				methods	: []
			};		
			_this.codeSymbols.push(classSymbol);			
			return classSymbol;
		} 
		
		// =======================================================================
		// Prototype Field 
		// =======================================================================
		function addProtoField(node, datatype, value)
		{
			if(!classSymbol) return; 		
			var offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(node.lineno-_compiler.currFileStartLine)+1);
			classSymbol.fields.push({
				  name: node.value
				, lineno: node.lineno - _compiler.currFileStartLine
				, start: node.start - offset
				, end: node.end - offset
				
				, datatype: datatype || undefined
				, value: value || undefined
			
				, "public": true
				, "private": false
				, "protected": false
				, "static": false
			});
		}  
		
		// =======================================================================
		// Prototype Method 
		// =======================================================================
		function addProtoMethod(ast, returnType, value)
		{
			if(!classSymbol) return; 			                                                                      
			var node = ast[0];		
			var offset = (!_compiler.currFile ? 0 : _compiler.currFileOffset-(node.lineno-_compiler.currFileStartLine)+1);
			classSymbol.methods.push({
				  name: node.value
				, lineno: node.lineno - _compiler.currFileStartLine
				, start: node.start - offset
				, end: node.end - offset
				, datatype: node.returntype || undefined
				, parameters: ast[1].paramsList
				
				, "public": true
				, "private": false
				, "protected": false
				, "static": false
			});
		}  
		
		// =======================================================================
		// Read prototype member
		// =======================================================================
		switch(node.value)
		{
			// Special case setter/getter
			// Code generation missing?
			case "__defineGetter__":
			case "__defineSetter__":
				break;
				
			default:				
								
				switch(node[1].type)
				{
					// Class1.prototype = new Class2;
					case jsdef.NEW:
					case jsdef.NEW_WITH_ARGS:
						classSymbol = getClassSymbol(node[0][0]);
						classSymbol.bases = [ node[1][0].value ]; 
						break;
						
					// Class1.prototype.xxx = 5;
					case jsdef.NUMBER:
						classSymbol = getClassSymbol(node[0][0][0]);
						addProtoField(node[0], "Number", node[1].value);
						break;
						
					// Class1.prototype.xxx = "string";
					case jsdef.STRING:
						classSymbol = getClassSymbol(node[0][0][0]);
						addProtoField(node[0], "String", node[1].value);
						break;
						
					// Class1.prototype.xxx = true;
					case jsdef.TRUE:
					case jsdef.FALSE:
						classSymbol = getClassSymbol(node[0][0][0]);
						addProtoField(node[0], "Boolean", node[1].value);
						break;
					
					// Class1.prototype.xxx = null;	
					case jsdef.NULL:
						classSymbol = getClassSymbol(node[0][0][0]);
						addProtoField(node[0], "Object", "null");
						break;
						
					// Class1.prototype.xxx = function()
					case jsdef.FUNCTION:						
						classSymbol = getClassSymbol(node[0][0][0]);						
						addProtoMethod(node);
						break;
						
					// Class1.prototype.xxx;
					case jsdef.IDENTIFIER:
						break;
						
					// Class1.prototype.xxx = [];
					case jsdef.ARRAY_INIT:
						classSymbol = getClassSymbol(node[0][0][0]);
						addProtoField(node[0], "Array", "[]");
						break;
					
					// Class1.prototype.xxx = {};
					case jsdef.OBJECT_INIT:
						classSymbol = getClassSymbol(node[0][0][0]);
						addProtoField(node[0], "Object", "{}");
						break;			
					
					// Class1.prototype.__defineSetter__("prop", function(){});
					case jsdef.GETTER:
					case jsdef.SETTER:						
						break;
									
					default:
						break;
				}
		}  
		
		//if(classSymbol) _this.TRACE(classSymbol);
	};
	
	////////////////////////////////////////////////////////////////////////////////////////////////////
	// Experimental: heuristics based variable datatype detection when not pluggable type system is used.
	this.detectDataType = function(varItem)
	{		
		if(!varItem.value) return;
		
		var dt = undefined;
		
		switch(varItem.value.type)
		{
		case jsdef.NEW_WITH_ARGS:
		case jsdef.NEW: 
			dt = varItem.value[0].value;
			break;
			
		case jsdef.ARRAY_INIT:
			dt = "Array";
			break;
			
		case jsdef.OBJECT_INIT:
			dt = "Object";
			break;
			
		case jsdef.NULL:
		case jsdef.OR: // a = a || null;						
			dt = "Object";
			break;
			
		case jsdef.STRING:
			dt = "String";
			break;
			
		case jsdef.DATE:
			dt = "Date";
			break;
	
		case jsdef.REGEXP:
			dt = "RegExp";
			break;
		
		// Numbers and numeric operators result in Number!
		case jsdef.NUMBER:
		case jsdef.ADD:	
		case jsdef.DECREMENT:
		case jsdef.DIV:	
		case jsdef.EXPONENT:
		case jsdef.INCREMENT:
		case jsdef.LSH:
		case jsdef.MINUS:
		case jsdef.MOD:
		case jsdef.MUL:	
		case jsdef.PLUS:
		case jsdef.RSH:
		case jsdef.SUB:	
		case jsdef.URSH:
		case jsdef.UNARY_PLUS:
		case jsdef.UNARY_MINUS:						
			dt = "Number";
			break;
						
		// Booleans and logic operators result in Boolean!
		case jsdef.FALSE:
		case jsdef.TRUE:
		case jsdef.BITWISE_OR:
		case jsdef.BITWISE_XOR:
		case jsdef.BITWISE_AND:
		case jsdef.STRICT_EQ:
		case jsdef.EQ:
		case jsdef.STRICT_NE:
		case jsdef.NE:
		case jsdef.LE:
		case jsdef.LT:
		case jsdef.GE:
		case jsdef.GT:
			dt = "Boolean";
			break;
					
		// ======== DATATYPE HEURISTICS ======== //
			
		// a = Math.cos(x)	
		case jsdef.CALL:
			if(varItem.value[0] && varItem.value[0][0] && varItem.value[0][0].value=="Math") dt = "Number";
			break;														
			
		// a.b
		case jsdef.DOT:							
			// Enum Heuristics
			if(varItem.value.length==2 && varItem.value[0].value.indexOf("_ENUM")==0)
				dt = varItem.value[0].value;
			break;
	
		// a[i]
		case jsdef.INDEX:
			//TODO: Detect array type.
			break;
			
		// a = b;				
		case jsdef.IDENTIFIER:
			//TODO: Detect identifier type.
			break;
			
		case jsdef.FUNCTION:
			//TODO: Detect function return type.
			break;
			
		case jsdef.GROUP:
			//TODO: Detect group return type.
			break;
									
		default:
			break;
		}						
		
		return dt;		
	}		
}
