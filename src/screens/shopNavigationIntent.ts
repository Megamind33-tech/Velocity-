/** Dock “Plane store” opens unified shop on PLANES tab — consumed in ShopScreenWrapper.show */
let openPlanesTab = false;

export function requestPlaneStoreOpen(): void {
    openPlanesTab = true;
}

export function consumePlaneStoreOpen(): boolean {
    const v = openPlanesTab;
    openPlanesTab = false;
    return v;
}
