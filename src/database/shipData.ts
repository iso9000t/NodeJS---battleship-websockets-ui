class Board {
  ships = [];
  attacks = [];
  field = Array(10)
    .fill(null)
    .map(() => Array(10).fill({ status: 'empty', ship: null }));

  addShips(ships) {
    ships.forEach((ship) => {
      for (let i = 0; i < ship.length; i++) {
        const x = ship.position.x + (ship.direction ? 0 : i);
        const y = ship.position.y + (ship.direction ? i : 0);
        this.field[x][y] = { status: 'safe', ship };
      }
    });
    this.ships = ships;
  }

  checkAttack(x, y) {
    if (this.field[x][y].status === 'safe') {
      this.field[x][y].status = 'hit';
      const ship = this.field[x][y].ship;
      // Check if all parts of the ship have been hit
      const isKilled = ship.position.every(
        (pos) => this.field[pos.x][pos.y].status === 'hit'
      );
      if (isKilled) {
        // Mark ship as killed
        ship.killed = true;
        // Additional logic to mark surrounding cells to e implemented later
      }
      return { x, y, status: 'hit', killed: isKilled };
    } else {
      this.field[x][y].status = 'miss';
      return { x, y, status: 'miss' };
    }
  }
}
