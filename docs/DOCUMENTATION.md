<a name="module_myModule"></a>

## myModule

* [myModule](#module_myModule)
    * [~newMember](#module_myModule..newMember)
        * [new newMember()](#new_module_myModule..newMember_new)
    * [~newTestFunction(someParamA, someParamB)](#module_myModule..newTestFunction) ⇒ <code>Number</code>
    * [~newTestFunction2(inputs, config)](#module_myModule..newTestFunction2) ⇒ <code>Object</code>

<a name="module_myModule..newMember"></a>

### myModule~newMember
My new constant

**Kind**: inner class of [<code>myModule</code>](#module_myModule)  
<a name="new_module_myModule..newMember_new"></a>

#### new newMember()
[constructor description]

<a name="module_myModule..newTestFunction"></a>

### myModule~newTestFunction(someParamA, someParamB) ⇒ <code>Number</code>
This is the amazing new test function

**Kind**: inner method of [<code>myModule</code>](#module_myModule)  
**Returns**: <code>Number</code> - Returns a number!  

| Param | Type | Description |
| --- | --- | --- |
| someParamA | <code>Array</code> | Test param A |
| someParamB | <code>Ol.Object</code> | Test param B |

<a name="module_myModule..newTestFunction2"></a>

### myModule~newTestFunction2(inputs, config) ⇒ <code>Object</code>
Parse array of files, and then render the parsed data through the defined layout plugin.

    parseFiles(['src/main.js'], {'ignore': [], 'parser': 'dox', 'layout': 'markdown'}).then(content => {});

**Kind**: inner method of [<code>myModule</code>](#module_myModule)  
**Returns**: <code>Object</code> - Promise  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| inputs | <code>Array</code> | Array of directory globs and/or files. |
| config | <code>Object</code> | Configuration object. |
| config.ignore | <code>String</code> | Array of paths to ignore. |
| config.parser | <code>String</code> | String representing the parser to be used. |
| config.layout | <code>String</code> | String representing the layout plugin to be used. |
