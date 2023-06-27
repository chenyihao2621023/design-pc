//magix-composer#snippet;
//magix-composer#exclude = loader
if (!Array.prototype.at) {
    Array.prototype.at = function (n) {
        let len = this.length;
        // ToInteger() abstract op
        n = (n | 0);
        // Allow negative indexing from the end
        if (n < 0) n += len;
        // OOB access is guaranteed to return undefined
        if (n < 0 || n >= len) return undefined;
        // Otherwise, this is just normal property access
        return this[n];
    };
}