#include <bits/stdc++.h>
using namespace std;

void setBit(uint64_t &value, int bit) {
    if (bit < 0 || bit > 63) return;
    value |= (1ULL << 63-bit);
}

bool getBit(uint64_t value, int bit) {
    if (bit < 0 || bit > 63) return 0;
    return (value & (1ULL << (63 - bit)));
}

void popBit(uint64_t &value, int bit) {
    if (bit < 0 || bit > 63) return;
    if (getBit(value, bit)) {
        value &= ~(1ULL << (63 - bit));
    }
}