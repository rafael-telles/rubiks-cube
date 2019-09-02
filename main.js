function multiplyMatrixAndPoint(matrix, point) {

    //Give a simple variable name to each part of the matrix, a column and row number
    var c0r0 = matrix[0], c1r0 = matrix[1], c2r0 = matrix[2], c3r0 = matrix[3];
    var c0r1 = matrix[4], c1r1 = matrix[5], c2r1 = matrix[6], c3r1 = matrix[7];
    var c0r2 = matrix[8], c1r2 = matrix[9], c2r2 = matrix[10], c3r2 = matrix[11];
    var c0r3 = matrix[12], c1r3 = matrix[13], c2r3 = matrix[14], c3r3 = matrix[15];

    //Now set some simple names for the point
    var x = point[0];
    var y = point[1];
    var z = point[2];
    var w = point[3];

    //Multiply the point against each part of the 1st column, then add together
    var resultX = (x * c0r0) + (y * c0r1) + (z * c0r2) + (w * c0r3);

    //Multiply the point against each part of the 2nd column, then add together
    var resultY = (x * c1r0) + (y * c1r1) + (z * c1r2) + (w * c1r3);

    //Multiply the point against each part of the 3rd column, then add together
    var resultZ = (x * c2r0) + (y * c2r1) + (z * c2r2) + (w * c2r3);

    //Multiply the point against each part of the 4th column, then add together
    var resultW = (x * c3r0) + (y * c3r1) + (z * c3r2) + (w * c3r3);

    return [resultX, resultY, resultZ, resultW];
}

function multiplyMatrices(matrixA, matrixB) {

    // Slice the second matrix up into columns
    var column0 = [matrixB[0], matrixB[4], matrixB[8], matrixB[12]];
    var column1 = [matrixB[1], matrixB[5], matrixB[9], matrixB[13]];
    var column2 = [matrixB[2], matrixB[6], matrixB[10], matrixB[14]];
    var column3 = [matrixB[3], matrixB[7], matrixB[11], matrixB[15]];

    // Multiply each column by the matrix
    var result0 = multiplyMatrixAndPoint(matrixA, column0);
    var result1 = multiplyMatrixAndPoint(matrixA, column1);
    var result2 = multiplyMatrixAndPoint(matrixA, column2);
    var result3 = multiplyMatrixAndPoint(matrixA, column3);

    // Turn the result columns back into a single matrix
    return [
        result0[0], result1[0], result2[0], result3[0],
        result0[1], result1[1], result2[1], result3[1],
        result0[2], result1[2], result2[2], result3[2],
        result0[3], result1[3], result2[3], result3[3]
    ];
}

function getIdentityMatrix() {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1,
    ]
}
function getTransform(element) {


    const transform = getComputedStyle(element).transform
    try {
        if (transform.includes('matrix3d')) {
            var matrixFromStyle = /matrix3d\((.*)\)/.exec(transform)[1]
            return matrixFromStyle.split(/,\s/).map(Number)
        } else if (transform.includes('matrix')) {
            var matrixFromStyle = /matrix\((.*)\)/.exec(transform)[1]
            var matrix2d = matrixFromStyle.split(/,\s/).map(Number)

            // matrix(a, b, c, d, tx, ty) is a shorthand for
            // matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1).
            return [matrix2d[0], matrix2d[1], 0, 0, matrix2d[2], matrix2d[3], 0, 0, 0, 0, 1, 0, matrix2d[4], matrix2d[5], 0, 1]
        }
        if (matrix.length === 4 * 4) {
            return matrix
        } else {
            return getIdentityMatrix()
        }
    } catch(e) {
        return getIdentityMatrix()
    }
}

function setTransform(element, matrix) {
    element.style.transform = 'matrix3d(' + matrix.join(',') + ')'
}
function applyTransform(element, matrix) {
    setTransform(element, multiplyMatrices(matrix, getTransform(element)))
}

function rotateAroundXAxis(a) {
    return [
        1, 0, 0, 0,
        0, Math.cos(a), -Math.sin(a), 0,
        0, Math.sin(a), Math.cos(a), 0,
        0, 0, 0, 1
    ];
}

function rotateAroundYAxis(a) {
    return [
        Math.cos(a), 0, Math.sin(a), 0,
        0, 1, 0, 0,
        -Math.sin(a), 0, Math.cos(a), 0,
        0, 0, 0, 1
    ];
}

function rotateAroundZAxis(a) {
    return [
        Math.cos(a), -Math.sin(a), 0, 0,
        Math.sin(a), Math.cos(a), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];
}

function findPiecesOnSide(side) {
    const filter = {
        "back": transform => transform[14] === -50,
        "front": transform => transform[14] === 50,
        "top": transform => transform[13] === -50,
        "bottom": transform => transform[13] === 50,
        "left": transform => transform[12] === -50,
        "right": transform => transform[12] === 50,
    }[side]

    const allPieces = document.querySelectorAll('.piece')
    const pieces = [...allPieces].filter(piece => {
        const localTransform = getTransform(piece)
        const parentTransform = getTransform(piece.parentElement)
        const transform = multiplyMatrices(parentTransform, localTransform)
        console.log(piece, transform)
        return filter(transform)
    })
    return pieces
}

function rotateSide(side) {
    const func = {
        "back": rotateAroundZAxis,
        "front": rotateAroundZAxis,
        "top": rotateAroundYAxis,
        "bottom": rotateAroundYAxis,
        "left": rotateAroundXAxis,
        "right": rotateAroundXAxis,
    }[side]

    const pieces = findPiecesOnSide(side)
    const containers = pieces.map(p => p.parentElement)
    containers.map(p => applyTransform(p, func(Math.PI / 2)))
}