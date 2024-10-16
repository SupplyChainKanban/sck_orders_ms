export const sleep = (ms: number) => {
    return new Promise(
        (res) => {
            setTimeout(() => {
                res(true);
            }, ms);
        }
    )

}