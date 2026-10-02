#include <algorithm>
#include <sstream>
#include <string>
#include <vector>
#include <cctype>
#include <cstdlib>

struct Step {
    std::string type;
    std::vector<int> values;
    int pivotIndex;
    int low;
    int high;
    int i;
    int j;
    std::string message;
};

static std::string escapeJson(const std::string& s) {
    std::string out;
    for (char c : s) {
        if (c == '"' || c == '\\') { out += '\\'; out += c; }
        else if (c == '\n') out += "\\n";
        else if (c == '\r') out += "\\r";
        else if (c == '\t') out += "\\t";
        else out += c;
    }
    return out;
}

static std::vector<int> parseNumbers(const std::string& input) {
    std::vector<int> values;
    std::stringstream ss(input);
    std::string token;
    while (std::getline(ss, token, ',')) {
        std::stringstream item(token);
        long long value;
        char extra;
        if (!(item >> value) || (item >> extra)) continue;
        if (value >= -1000000000LL && value <= 1000000000LL)
            values.push_back(static_cast<int>(value));
    }
    return values;
}

static void addStep(std::vector<Step>& steps, const std::string& type,
                    const std::vector<int>& a, int pivotIndex,
                    int low, int high, int i, int j,
                    const std::string& message) {
    steps.push_back({type, a, pivotIndex, low, high, i, j, message});
}

static int partitionArray(std::vector<int>& a, int low, int high,
                          std::vector<Step>& steps) {
    int pivot = a[high]; // Lomuto partition scheme: choose last element as pivot.
    int i = low - 1;
    addStep(steps, "pivot", a, high, low, high, i, high,
            "Choose " + std::to_string(pivot) +
            " as the pivot (the last element in this range).");

    for (int j = low; j < high; ++j) {
        addStep(steps, "compare", a, high, low, high, i, j,
                "Compare " + std::to_string(a[j]) + " with pivot " +
                std::to_string(pivot) + ".");
        if (a[j] <= pivot) {
            ++i;
            if (i != j) {
                std::swap(a[i], a[j]);
                addStep(steps, "swap", a, high, low, high, i, j,
                        std::to_string(a[j]) + " and " + std::to_string(a[i]) +
                        " are swapped so values <= pivot move left.");
            } else {
                addStep(steps, "keep", a, high, low, high, i, j,
                        std::to_string(a[j]) + " is <= pivot, so it stays in the left partition.");
            }
        } else {
            addStep(steps, "keep", a, high, low, high, i, j,
                    std::to_string(a[j]) + " is > pivot, so it remains on the right for now.");
        }
    }

    int pivotPosition = i + 1;
    if (pivotPosition != high) {
        std::swap(a[pivotPosition], a[high]);
        addStep(steps, "pivot-placed", a, pivotPosition, low, high,
                pivotPosition, high,
                "Place pivot " + std::to_string(pivot) + " at index " +
                std::to_string(pivotPosition) + ". Values to its left are <= pivot; values to its right are > pivot.");
    } else {
        addStep(steps, "pivot-placed", a, pivotPosition, low, high,
                pivotPosition, high,
                "Pivot " + std::to_string(pivot) + " is already in its final position.");
    }
    return pivotPosition;
}

static void quickSort(std::vector<int>& a, int low, int high,
                      std::vector<Step>& steps) {
    if (low >= high) {
        if (low == high)
            addStep(steps, "base", a, low, low, high, low, high,
                    std::to_string(a[low]) + " is a one-element range, so it is already sorted.");
        return;
    }
    int p = partitionArray(a, low, high, steps);
    quickSort(a, low, p - 1, steps);
    quickSort(a, p + 1, high, steps);
}

std::string quickSortSteps(const std::string& input) {
    std::vector<int> values = parseNumbers(input);
    std::vector<Step> steps;
    addStep(steps, "start", values, -1, 0,
            static_cast<int>(values.size()) - 1, -1, -1,
            "Starting array. Quick Sort will partition around a pivot, then sort each side recursively.");

    if (!values.empty())
        quickSort(values, 0, static_cast<int>(values.size()) - 1, steps);

    addStep(steps, "done", values, -1, 0,
            static_cast<int>(values.size()) - 1, -1, -1,
            "Finished! The array is sorted in ascending order.");

    std::ostringstream out;
    out << "[";
    for (size_t k = 0; k < steps.size(); ++k) {
        if (k) out << ",";
        const Step& s = steps[k];
        out << "{\"type\":\"" << escapeJson(s.type) << "\",\"array\":[";
        for (size_t n = 0; n < s.values.size(); ++n) {
            if (n) out << ",";
            out << s.values[n];
        }
        out << "],\"pivotIndex\":" << s.pivotIndex
            << ",\"low\":" << s.low
            << ",\"high\":" << s.high
            << ",\"i\":" << s.i
            << ",\"j\":" << s.j
            << ",\"message\":\"" << escapeJson(s.message) << "\"}";
    }
    out << "]";
    return out.str();
}

#include <emscripten/bind.h>
EMSCRIPTEN_BINDINGS(quicksort_module) {
    emscripten::function("quickSortSteps", &quickSortSteps);
}
