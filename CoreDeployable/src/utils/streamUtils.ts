export async function streamToBuffer(readableStream: NodeJS.ReadableStream | null | undefined): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (!readableStream) {
      return resolve(Buffer.alloc(0));
    }

    const chunks: Buffer[] = [];
    
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    
    readableStream.on('error', reject);
  });
}